import React, { useEffect, useRef, useState } from 'react';
import { langs } from '@uiw/codemirror-extensions-langs';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import './Dash.css'


const Selectlang = ({ sockett, onChange }) => {

    const [selectedLanguage, SelectLan] = useState('javascript');

    const selectLanguageFunction = (lang) => {
        console.log(lang);
        SelectLan(lang);
        sockett?.emit('Updated langauge for backend', lang);
        sockett?.emit('Updated mode for backend', lang);
    }
    useEffect(() => {

        sockett?.on('Updated language for users', (lang) => {
            console.log(lang);
            SelectLan(lang);
        });

        sockett?.on('Language for new user', (lang) => {
            SelectLan(lang);
        })

        // sockett?.emit('Updated mode for users', selectedLanguage);

    }, [selectedLanguage, sockett]);




    return (
        <>
            <FormControl sx={{ m: 0.5, minWidth: 120 }}>
                <InputLabel id="demo-select-small-label">Language</InputLabel>
                <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small-label"
                    value={selectedLanguage}
                    label="Language"
                    onChange={(e) => {selectLanguageFunction(e.target.value);onChange(e); }}
                    className="custom-select"
                >

                    {/* {Object.keys(langs).map((language) => (


                    <MenuItem key={language} value={language} >
                        {language}
                    </MenuItem>

                    ))} */}

                    <MenuItem key="javascript" value="javascript" >
                        javascript
                    </MenuItem>
                    <MenuItem key="java" value="javascript" >
                        java
                    </MenuItem>
                    <MenuItem key="c" value="c" >
                        c
                    </MenuItem>
                    <MenuItem key="cpp" value="cpp" >
                        cpp
                    </MenuItem>
                    <MenuItem key="html" value="html" >
                        html
                    </MenuItem>
                    <MenuItem key="css" value="css" >
                        css
                    </MenuItem>
                    <MenuItem key="python" value="python" >
                        python
                    </MenuItem>
                </Select>
                {/* <FormHelperText>Select a Language</FormHelperText> */}
            </FormControl>
        </>
    );
};


export default Selectlang;
