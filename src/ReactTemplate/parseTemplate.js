import React from 'react';
import { prim, getOrHas } from './utils';

const ERROR_INVALID_ANCHOR_TYPE =
    'In template render, Array element[0] must be a string representing a component and array element[1] may be a props object for the component. If array element[1] is not a props object, then element[1] to remaining array elements will be rendered as children of element[0].';

const BASIC_ELEMENT_TYPES = ['null', 'undefined', 'number', 'string'];
const FRAGMENT_TYPES = ['React.Fragment', 'Fragment'];

const isProps = (obj) => {
    const has = getOrHas(obj);
    return prim(obj) === 'object' && !(has('condition') && has('render'));
};

const getFirstTwoElements = ([root, props]) => {
    if (prim(root) === 'string') {
        return `ElementWith${isProps(props) ? '' : 'out'}Props`;
    }
    if (root === null || FRAGMENT_TYPES.includes(root)) {
        return `FragmentWith${isProps(props) ? '' : 'out'}Props`;
    }

    return 'Error';
};

const handleArray = (Compound, parserKeys) => (arr, numericKey) => {
    const firstTwo = arr.slice(0, 2);
    const result = getFirstTwoElements(firstTwo);
    const key = `${parserKeys.INSTANCE_ID}${numericKey}`;

    if (result === 'Error') {
        console.error(ERROR_INVALID_ANCHOR_TYPE);
        return null;
    }
    if (result.startsWith('Fragment')) {
        const childElements = arr.slice(
            result === 'FragmentWithoutProps' ? 1 : 2
        );
        return (
            <Compound.AnchorComponent key={key} Component={React.Fragment}>
                {childElements.map((element, index) =>
                    parseTemplate(Compound, parserKeys)(
                        element,
                        `${numericKey}${index}`
                    )
                )}
            </Compound.AnchorComponent>
        );
    }
    let elementProps = {};
    if (result === 'ElementWithProps') {
        elementProps = arr[1];
    }
    const childElements = arr.slice(result === 'ElementWithoutProps' ? 1 : 2);
    return (
        <Compound.AnchorComponent
            key={key}
            component={arr[0]}
            componentProps={elementProps || {}}
        >
            {childElements.map((element, index) =>
                parseTemplate(Compound, parserKeys)(
                    element,
                    `${numericKey}${index}`
                )
            )}
        </Compound.AnchorComponent>
    );
};

const parseTemplate = (Compound, parserKeys) => {
    const parseAnchorArray = handleArray(Compound, parserKeys);

    const parser = (element, numericKey = 0) => {
        const elementKey = `${parserKeys.INSTANCE_ID}${numericKey}`;
        const elType = prim(element);
        const get = getOrHas(element, 'get');
        const has = getOrHas(element);
        const parse = parseTemplate(Compound, parserKeys);
        if (elType === 'array') {
            return parseAnchorArray(element, numericKey);
        }
        if (has('condition') && has('render')) {
            const childrenWhenTrue = parse(get('render[0]'));
            const childrenWhenFalse = parse(get('render[1]'));
            return (
                <Compound.ConditionalRenderer
                    key={elementKey}
                    condition={element.condition}
                    childrenWhenTrue={childrenWhenTrue}
                    childrenWhenFalse={childrenWhenFalse}
                />
            );
        }
        if (elType === 'string' && element.startsWith(parserKeys.PARSE_JSX)) {
            const jsxExpression = element.slice(parserKeys.PARSE_JSX.length);

            return (
                <Compound.JSXElement key={elementKey} element={jsxExpression} />
            );
        }
        if (elType === 'string' && element.startsWith(parserKeys.PARSE_CHILD)) {
            return (
                <Compound.ReactChildClone
                    key={elementKey}
                    parentKey={elementKey}
                    element={element}
                />
            );
        }
        if (BASIC_ELEMENT_TYPES.includes(elType)) {
            return <Compound.BasicElement key={elementKey} element={element} />;
        }
        throw new Error(`${JSON.stringify(element)} is not a supported type.`);
    };

    return parser;
};

export default parseTemplate;
