import { useCallback, useEffect, useState } from 'react';
import get from 'lodash/get';
import { useTemplateContext } from '../../context';

const reducer = (obj, imports, parser, queriesData, context = {}, store) =>
    Object.keys(obj).reduce((acc, k) => {
        return {
            ...acc,
            [k]: parser(obj[k], {
                get,
                ...(imports?.modules || {}),
                data: queriesData,
                ...acc,
                context,
                store,
            }),
        };
    }, {});

const useTemplateState = (
    { state = {}, constants = {} },
    parser,
    queriesData,
    store
) => {
    const [importRuntimeDependency, setImportRuntimeDependency] = useState({
        runEffect: false,
        imports: {},
    });
    const [readyToDispatch, setReadyToDispatch] = useState(false);
    const [templateState, setTemplateState] = useState({});
    const { context } = useTemplateContext();
    useEffect(() => {
        if (importRuntimeDependency.runEffect) {
            const { imports } = importRuntimeDependency;
            const parsedState = reducer(
                state,
                imports,
                parser,
                queriesData,
                context,
                store
            );
            const parsedConstants = reducer(
                constants,
                imports,
                parser,
                queriesData,
                context,
                store
            );
            setTemplateState({
                ...parsedState,
                ...parsedConstants,
                ...queriesData,
            });
            setReadyToDispatch(true);
        }
    }, [importRuntimeDependency.runEffect]);

    const processEffect = useCallback((imports) => {
        setImportRuntimeDependency({
            runEffect: true,
            imports,
        });
    }, []);

    return {
        readyToDispatch,
        templateState,
        processEffect,
    };
};

export default useTemplateState;
