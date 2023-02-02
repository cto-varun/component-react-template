import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Space, Row, Col, Typography, notification, Button, Alert } from 'antd';
import get from 'lodash/get';

const DEFAULT_COMPONENT_IMPORTS = {
    Space,
    Row,
    Col,
    Typography,
    Button,
    Alert,
};

const DEFAULT_MODULE_IMPORTS = {
    notification,
    get,
};

const TemplateStateContext = createContext();
const TemplateDispatchContext = createContext();

const useTemplateState = () => {
    const context = useContext(TemplateStateContext);
    if (!context) {
        return {};
    }

    return context;
};

const useTemplateDispatch = () => {
    const context = useContext(TemplateDispatchContext);
    if (!context) {
        return null;
    }

    return context;
};

const noop = () => {};

export const useTemplateContext = () => {
    const [state, dispatch] = [useTemplateState(), useTemplateDispatch()];

    return {
        isReady: state.isReady || false,
        context: state?.context || {},
        components: state?.imports?.components || {},
        modules: state?.imports?.modules || {},
        dispatch: dispatch || noop,
    };
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'register': {
            return {
                ...state,
                context: {
                    ...state.context,
                    ...action.context,
                },
                imports: {
                    modules: {
                        ...(state?.imports?.modules || {}),
                        ...action.imports?.modules,
                    },
                    components: {
                        ...(state?.imports?.components || {}),
                        ...action.imports?.components,
                    },
                },
            };
        }

        case 'update': {
            return {
                ...state,
                context: {
                    ...state.context,
                    ...action.context,
                },
            };
        }

        case 'isReady': {
            return {
                ...state,
                isReady: true,
            };
        }

        default: {
            throw new Error(`Unknown action type: ${action.type}`);
        }
    }
};

const INITIAL_REGISTER = {
    context: {},
    imports: {
        components: {},
        modules: {},
    },
    isReady: false,
};

const initialState = (register = INITIAL_REGISTER) => ({
    isReady: register.isReady,
    context: {
        ...register.context,
    },
    imports: {
        components: {
            ...register.imports.components,
            ...DEFAULT_COMPONENT_IMPORTS,
        },
        modules: {
            ...register.imports.modules,
            ...DEFAULT_MODULE_IMPORTS,
        },
    },
});

const TemplateProvider = ({
    children,
    isParentProvider,
    isReadyToRegister,
    register,
}) => {
    const [state, dispatch] = useReducer(
        reducer,
        initialState(INITIAL_REGISTER)
    );

    useEffect(() => {
        if (isReadyToRegister) {
            if (isParentProvider) {
                dispatch({
                    type: 'register',
                    ...register,
                });
            }

            dispatch({ type: 'isReady' });
        }
    }, [isParentProvider, isReadyToRegister]);

    return (
        <TemplateStateContext.Provider value={state}>
            <TemplateDispatchContext.Provider value={dispatch}>
                {children}
            </TemplateDispatchContext.Provider>
        </TemplateStateContext.Provider>
    );
};

export default TemplateProvider;
