import './user-drop-down.css';
import { useRef, useState } from 'react'
import useAuth from '../../../hooks/useAuth';
import { AiOutlineClose } from 'react-icons/ai';
import { FiSun, FiMoon } from 'react-icons/fi';
import useRandomBg from '../../../hooks/useRandomBg';

const UserDropDown = () => {
    const [userDropDown, setUserDropDown] = useState(false);
    const { email, logout, userName } = useAuth();
    const dropdownRef = useRef(null);
    const { randomBg } = useRandomBg();
    const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

    const toggleDarkMode = () => {
        const nextDark = !darkMode;
        setDarkMode(nextDark);
        if (nextDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'disabled');
        }
    };

    return (
        <div className='user-detail-container'>
            <div className='user-logo' style={{ backgroundColor: `${randomBg}` }} onClick={() => { setUserDropDown(!userDropDown) }}>
                {email?.slice(0, 1).toUpperCase()}
            </div>
            {userDropDown &&
                <div className='user-drop-down-container' ref={dropdownRef} onBlur={() => setUserDropDown(false)}>
                    <div className='close-profile-dropdown-wrap' onClick={() => setUserDropDown(false)}>
                        <AiOutlineClose />
                    </div>
                    <div className='profile-dropdown-content-wrap'>
                        <p className='dropdown-user-email'>{email}</p>
                        <div className='dropdown-profile-img' style={{ backgroundColor: `${randomBg}` }}>
                            {email?.slice(0, 1).toUpperCase()}
                        </div>
                        <h3 className='dropdown-user-name'> Hi <span>{userName}!</span></h3>
                        
                        <div className='theme-toggle-row' onClick={toggleDarkMode}>
                            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                            <button className='theme-toggle-btn'>
                                {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
                            </button>
                        </div>

                        <button className='signout-btn' onClick={logout}>Sign out</button>
                    </div>
                </div>
            }
        </div>
    )
}

export default UserDropDown;