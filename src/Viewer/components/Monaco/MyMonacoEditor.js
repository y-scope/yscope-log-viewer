import React, {useContext, useEffect, useRef, useState} from "react";
import * as monaco from 'monaco-editor';

export const MyMonacoEditor = (props) => {
    const {beforeMount, onMount} = props
    const editor = useRef(null)

    const _beforeMount = () => {
        beforeMount();

        //... add you own stuff
    }
    useEffect(()=>{
        _beforeMount(monaco);
        //... create editor
        editor.current = monaco.editor.create(document.getElementById('container'), {
            value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
            language: 'javascript'
          });
        // onMount(monaco);
    }, [])
    
    return <div id="container">
        
    </div>
}