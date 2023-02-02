import React, {
    cloneElement,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react';
import { Spin } from 'antd';
import JSXParser from 'react-jsx-parser';
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import TemplateProvider, { useTemplateContext } from '../context';
import useRegister from './hooks/useRegister';
import { prim, getOrHas } from './utils';
import parseTemplate from './parseTemplate';
import parseExpression from './parseExpression';
import { useLocation } from 'react-router-dom';

const getAnchorComponent = (parser) => ({
    component,
    componentProps = {},
    children,
}) => {
    const { context, dispatch, components, modules } = useTemplateContext();
    const [Component, setComponent] = useState();
    const [anchorProps, setAnchorProps] = useState({});
    const options = useMemo(
        () => ({
            ...context,
            ...modules,
            dispatch,
        }),
        [context, modules]
    );

    useEffect(() => {
        if (
            component === null ||
            ['React.Fragment', 'Fragment'].includes(component)
        ) {
            setComponent(() => React.Fragment);
        } else if (!Component) {
            const element =
                getOrHas(components, 'get')(component) ||
                component ||
                React.Fragment;

            setComponent(() => element);
        }
    }, [component]);

    useEffect(() => {
        let props = parser(componentProps, options) || {};
        if (props.css) {
            props = {
                ...props,
                css:
                    prim(props.css) === 'object'
                        ? css(props.css)
                        : css`
                              ${props.css}
                          `,
            };
        }

        setAnchorProps(props);
    }, [options]);

    return Component ? (
        <Component {...anchorProps}>{children}</Component>
    ) : null;
};

const getBasicElement = (parser) => ({ element }) => {
    const { context, dispatch, modules } = useTemplateContext();
    const options = useMemo(
        () => ({
            ...context,
            ...modules,
            dispatch,
        }),
        [context, modules]
    );

    const [expressionFunction, setExpressionFunction] = useState();
    useEffect(() => {
        const result = parser(element, options);
        setExpressionFunction(result);
    }, [options]);

    return expressionFunction ? expressionFunction || null : null;
};

const getConditionalRenderer = (parser) => ({
    condition,
    childrenWhenTrue,
    childrenWhenFalse,
}) => {
    const { context, dispatch, modules } = useTemplateContext();
    const options = useMemo(
        () => ({
            ...context,
            ...modules,
            dispatch,
        }),
        [context, modules]
    );

    const [expressionCondition, setExpressionCondition] = useState();
    useLayoutEffect(() => {
        const result = parser(condition, options);
        setExpressionCondition(result);
    }, [options]);

    if (expressionCondition == null) return null;

    return expressionCondition ? childrenWhenTrue : childrenWhenFalse;
};

const renderError = (jsxExpression) => {
    console.warn(
        `Failed to parse expression <${jsxExpression}>. Rendering fallback...`
    );

    return null;
};

const JSXElement = ({ element }) => {
    const { context, dispatch, components, modules } = useTemplateContext();

    const options = useMemo(
        () => ({
            ...context,
            ...modules,
            dispatch,
        }),
        [context, modules]
    );

    const [jsxExpression] = useState(element);

    return (
        <JSXParser
            jsx={jsxExpression}
            bindings={options}
            components={components}
            renderInWrapper={false}
            renderError={() => renderError(jsxExpression)}
        />
    );
};

const getReactChildClone = (parser, parentProps) => ({ element }) => {
    const [ClonedComponent, setClonedComponent] = useState();
    const [readyToRender, setReadyToRender] = useState(false);
    useEffect(() => {
        const el = parser(element);
        if (el) {
            setClonedComponent(
                () =>
                    function IntermediateClone() {
                        return cloneElement(el, { parentProps });
                    }
            );
            setReadyToRender(true);
        }
    }, []);

    return readyToRender ? <ClonedComponent /> : null;
};

const getCompoundComponents = (parser, parentProps) => ({
    AnchorComponent: getAnchorComponent(parser),
    BasicElement: getBasicElement(parser),
    ConditionalRenderer: getConditionalRenderer(parser),
    JSXElement,
    ReactChildClone: getReactChildClone(parser, parentProps),
});

const TemplateRenderer = ({
    showLoader = true,
    renderElements,
    parser,
    parserKeys,
    startChildRender = null,
    parentProps,
}) => {
    const [elements, setElements] = useState(null);
    const [isReadyToRender, setIsReadyToRender] = useState(false);
    const { isReady } = useTemplateContext();

    useEffect(() => {
        if (isReady && startChildRender !== false) {
            if (elements) {
                setIsReadyToRender(true);
            } else {
                const parsedElements = parseTemplate(
                    getCompoundComponents(parser, parentProps),
                    parserKeys
                )(renderElements);
                setElements(parsedElements);
            }
        }
    }, [elements, isReady, startChildRender]);

    const loading = showLoader ? <Spin tip="Loading..." /> : null;

    return isReadyToRender ? elements : loading;
};

const Template = (props) => {
    const {
        data,
        component: { id, params: config },
        children = [],
        plugin,
        store,
    } = props;
    const isParentProvider = config.isParentProvider || false;

    const location = useLocation();

    const [expressionIterator, parserKeys] = useMemo(
        () =>
            parseExpression(
                config.id || id,
                config,
                React.Children.toArray(children)
            ),
        [config]
    );

    const parser = useCallback(
        (expression, options) => expressionIterator(options)(expression),
        [config]
    );

    const [isReadyToRegister, registerData] = useRegister(
        config,
        plugin,
        parser,
        // adding location data and query string data here
        { ...data.data, ...location.state },
        store
    );

    const { dispatch } = useTemplateContext();
    const [startChildRender, setStartChildRender] = useState(false);
    useEffect(() => {
        if (!isParentProvider && isReadyToRegister) {
            dispatch({ type: 'register', ...registerData });
            setStartChildRender(true);
        }
    }, [isParentProvider, isReadyToRegister]);

    return isParentProvider ? (
        <TemplateProvider
            key={`${parserKeys.INSTANCE_ID}-provider`}
            isParentProvider={isParentProvider}
            isReadyToRegister={isReadyToRegister}
            register={registerData}
        >
            <TemplateRenderer
                showLoader={config.showLoader}
                renderElements={config.render}
                parser={parser}
                parserKeys={parserKeys}
                parentProps={props}
            />
        </TemplateProvider>
    ) : (
        <TemplateRenderer
            showLoader={config.showLoader}
            renderElements={config.render}
            parser={parser}
            parserKeys={parserKeys}
            startChildRender={startChildRender}
        />
    );
};

export default Template;
