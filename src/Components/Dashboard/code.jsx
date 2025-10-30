import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/css/css';

import './Dash.css';
import 'codemirror/addon/edit/closebrackets';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/html-hint';
import 'codemirror/addon/hint/css-hint';
import 'codemirror/addon/hint/anyword-hint';

import '../../../node_modules/codemirror/theme/darcula.css'

const Code = ({ language, sockett, onCodeChange }) => {

    const [codetopass, setCode] = useState('');
    const editorRef = useRef();
    const [editor, setEditor] = useState(null);

    useEffect(() => {

        const config = {
            lineNumbers: true,
            mode: language === 'cpp' || language === 'c++' || language === 'c' ? 'text/x-csrc' : language,
            theme:'darcula',
            autocorrect: true,
            extraKeys: {
                'Alt': 'autocomplete', // Trigger auto-complete on Ctrl-Space
            },
            hintOptions: {
                completeSingle: false, // Show multiple options on autocomplete
            },
            matchBrackets: true, // Enable bracket matching
            autoCloseBrackets: true, 
            indentUnit: 4,       // Set the number of spaces for each level of indentation
            tabSize: 4,  
        };

        if (editor == null) {
            const cm = CodeMirror(editorRef.current, config);
            setEditor(cm);
            console.log(cm);
            cm?.on('keyup', (editor) => {
                const newCode = editor.getValue();
                setCode(newCode);
            });
            if (language === 'javascript') {
                import('codemirror/addon/hint/javascript-hint').then((javascriptHint) => {
                    cm.setOption('extraKeys', { 'Alt': 'autocomplete' });
                });
            } else if (language === 'html') {
                import('codemirror/addon/hint/html-hint').then((htmlHint) => {
                    cm.setOption('extraKeys', { 'Alt': 'autocomplete' });
                });
            } else if (language === 'css') {
                import('codemirror/addon/hint/css-hint').then((cssHint) => {
                    cm.setOption('extraKeys', { 'Alt': 'autocomplete' });
                });
            }else if (language === 'cpp' || language === 'c++' || language === 'c') {
                cm.setOption('mode', 'text/x-csrc');  // Set mode directly for C++
                cm.setOption('extraKeys', { 'Alt': 'autocomplete' });
            }
        } else {
            editor.setOption('mode', language === 'cpp' || language === 'c++' || language === 'c' ? 'text/x-csrc' : language);
        }
    }, [sockett, language]);

    useEffect(() => {
        const cursorPosition = editor?.getCursor();
        const line = cursorPosition?.line;
        var ch = cursorPosition?.ch;
        sockett?.emit('Updated code for backend', { codetopass, line, ch });
    }, [codetopass]);

    useEffect(() => {
        sockett?.on('Updated code for users', ({ codetopass, line, ch }) => {
            if (editor) {
                editor?.setValue(codetopass);
                editor?.setCursor({
                    line: line,
                    ch: ch,
                });
            }
        });
        sockett?.on('Updated mode for users', (lang) => {
            editor.setOption('mode', lang === 'cpp' || lang === 'c++' || lang === 'c' ? 'text/x-csrc' : lang);
        });
        sockett?.on('Code for new user', ( codee ) => {
            if (editor) {
                const cursorPosition = editor?.getCursor();
                const line = cursorPosition?.line;
                var ch = cursorPosition?.ch;
                editor?.setValue(codee);
                editor?.setCursor({
                    line: line,
                    ch: ch,
                });
            }
        })
        sockett?.on('mode for new user', ( lang ) => {
            editor.setOption('mode', lang === 'cpp' || lang === 'c++' || lang === 'c' ? 'text/x-csrc' : lang);
        })
    }, [sockett]);





    return (
        <>
            <div ref={editorRef} style={{ width: '100%', overflowX: 'hidden' }} />
        </>
    );
};


export default Code;
