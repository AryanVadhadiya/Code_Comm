import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import "./Dash.css";
import Selectlang from './selectlang';
import Code from './code';
import io from 'socket.io-client';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Users from './users.jsx';
import LogoutIcon from '@mui/icons-material/Logout';


function Dash() {
    const navigate = useNavigate();
    var socket;
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [providesocket, setSocketSetter] = useState(undefined);
    const [usernames, setUsernames] = useState(undefined);
    const [check, setCheck] = useState(false);


    //retrieve username and id;
    const username = localStorage.getItem('name');
    const location = useLocation();
    const id = location.pathname.split('/')[2];

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
    };
    const handleCodeChange = (newCode) => {
        setCode(newCode);
    };

    useEffect(() => {

        if (id && username && !check) {
            const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
            socket = io(backend);  ////////start point and using this socket we can use socket.xyz///////
            socket.emit('Update_users', { id, username });
            setSocketSetter(socket);
            setCheck(true);
        }

    }, []);

    useEffect(() => {

        socket?.on('User list for frontend', (usernames) => {
            setUsernames(usernames);
        });

    }, [socket]);

    useEffect(() => {

        socket?.on('New user joined', (username) => {
            toast(`${username} joined the room`);
        });
        socket?.on('User left the room', (username) => {
            toast(`${username} left the room`);
        });

    }, [socket]);

    const logoutt = () => {
        console.log('1');
        navigate('/');
        window.location.reload();
    }


    return (
        <div className='page'>
            <div className="topNav flex items-center justify-between px-4">
                <div className="leftBrand text-gray-200">CodeShare</div>
                <div className="centerControl">
                    <Selectlang sockett={providesocket} onChange={handleLanguageChange} />
                </div>
                <div className="rightControls flex items-center gap-3">
                    <div className="userCount text-gray-200">Users: {usernames?.length || 0}</div>
                    <LogoutIcon className='logoutIcon' onClick={logoutt} />
                </div>
            </div>

            <div className="mainContent flex">
                <section style={{ width: '95%' }}>
                    <Code language={selectedLanguage} sockett={providesocket} onCodeChange={handleCodeChange} />
                </section>
                <span className="divider" style={{ left: '95%' }} />
                <section style={{ width: '5%' }}>
                    <div className="usersArea h-full p-1 overflow-auto">
                        <div className='onlineUsers flex flex-wrap gap-3'>
                            {usernames?.map((name, key) => {
                                return (
                                    <Users initials={`${(name || '').slice(0,2).toUpperCase()}`} key={key} />
                                )
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Dash;
