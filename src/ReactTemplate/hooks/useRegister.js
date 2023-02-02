import { useEffect, useRef, useState } from 'react';
import useImports from './useImports';
import useTemplateState from './useTemplateState';

const useRegister = (config = {}, plugin, parser, queriesData = {}, store) => {
    const [importsAreReady, imports] = useImports(config, plugin);
    const { processEffect, readyToDispatch, templateState } = useTemplateState(
        config,
        parser,
        queriesData,
        store
    );
    const [isReadyToRegister, setIsReadyToRegister] = useState(false);
    const registerData = useRef();

    useEffect(() => {
        if (importsAreReady) {
            processEffect(imports);
        }
    }, [importsAreReady]);

    useEffect(() => {
        if (readyToDispatch) {
            registerData.current = {
                imports,
                context: templateState,
            };

            setIsReadyToRegister(true);
        }
    }, [readyToDispatch]);

    return [isReadyToRegister, registerData.current];
};

export default useRegister;
