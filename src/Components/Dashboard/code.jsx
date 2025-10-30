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
    const emitTimerRef = useRef(null);
    const suppressRemoteApplyRef = useRef(false);
    const pendingPatchesRef = useRef([]);
    const typingIntervalMsRef = useRef(Number(import.meta.env.VITE_TYPING_INTERVAL_MS) || 50);

    // Convert CodeMirror change object into a serializable minimal patch
    const toPatch = (changeObj) => {
        return {
            from: changeObj.from,
            to: changeObj.to,
            text: changeObj.text, // array of lines
            // removed: changeObj.removed, // can be included if needed for diagnostics
        };
    };

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
            // Use CodeMirror change event and throttle network emits to reduce event flood
            cm?.on('change', (instance, changeObj) => {
                if (suppressRemoteApplyRef.current) return; // ignore remote-applied updates
                const newCode = instance.getValue();
                setCode(newCode);
                // Accumulate patches to batch within the throttle window
                pendingPatchesRef.current.push(toPatch(changeObj));
                // Throttle: coalesce fast keystrokes into a single emit; interval may be overridden per-room
                if (emitTimerRef.current) clearTimeout(emitTimerRef.current);
                emitTimerRef.current = setTimeout(() => {
                    const patches = pendingPatchesRef.current.splice(0, pendingPatchesRef.current.length);
                    if (patches.length > 0) {
                        const cursorPosition = instance.getCursor();
                        const line = cursorPosition?.line ?? 0;
                        const ch = cursorPosition?.ch ?? 0;
                        // Send minimal patches to others, and include snapshot so server can persist and serve new users
                        sockett?.emit('Code patches for backend', { patches, snapshot: newCode, line, ch });
                    }
                }, typingIntervalMsRef.current);
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

    // Removed per-keystroke emit on state change; handled inside CodeMirror 'change' with throttle

    useEffect(() => {
        sockett?.on('Updated code for users', ({ codetopass, line, ch }) => {
            if (editor) {
                // Prevent triggering local 'change' handler when applying remote updates
                suppressRemoteApplyRef.current = true;
                editor?.setValue(codetopass);
                editor?.setCursor({ line, ch });
                // Allow local edits again on next tick
                setTimeout(() => { suppressRemoteApplyRef.current = false; }, 0);
            }
        });
        // Apply diff patches from other users sequentially
        sockett?.on('Code patches for users', ({ patches, line, ch }) => {
            if (editor && Array.isArray(patches) && patches.length > 0) {
                suppressRemoteApplyRef.current = true;
                try {
                    patches.forEach((p) => {
                        const replacement = Array.isArray(p.text) ? p.text.join('\n') : '';
                        editor.replaceRange(replacement, p.from, p.to, 'remote');
                    });
                    if (typeof line === 'number' && typeof ch === 'number') {
                        editor.setCursor({ line, ch });
                    }
                } finally {
                    setTimeout(() => { suppressRemoteApplyRef.current = false; }, 0);
                }
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
        // Update local typing interval when server sets per-room config
        sockett?.on('Updated typing interval for users', (ms) => {
            const n = Number(ms);
            if (!Number.isNaN(n) && n > 0) typingIntervalMsRef.current = n;
        });
        sockett?.on('Typing interval for new user', (ms) => {
            const n = Number(ms);
            if (!Number.isNaN(n) && n > 0) typingIntervalMsRef.current = n;
        });
        // Cleanup listeners on unmount or socket/editor change to avoid stacking handlers
        return () => {
            sockett?.off('Updated code for users');
            sockett?.off('Code patches for users');
            sockett?.off('Updated mode for users');
            sockett?.off('Code for new user');
            sockett?.off('mode for new user');
            sockett?.off('Updated typing interval for users');
            sockett?.off('Typing interval for new user');
            if (emitTimerRef.current) clearTimeout(emitTimerRef.current);
        };
    }, [sockett, editor]);





    return (
        <>
            <div ref={editorRef} style={{ width: '100%', overflowX: 'hidden' }} />
        </>
    );
};


export default Code;
