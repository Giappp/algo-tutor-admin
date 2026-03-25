"use client"
import React from 'react'
import {IconButton, Tooltip, useColorScheme} from "@mui/material";
import {DarkMode, LightMode} from "@mui/icons-material";

const ThemeToggle = () => {
    const {mode, setMode} = useColorScheme();

    if (!mode) return null;

    return (
        <Tooltip title={mode === 'dark' ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}>
            <IconButton
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                color="inherit"
            >
                {mode === 'dark' ? <LightMode/> : <DarkMode/>}
            </IconButton>
        </Tooltip>
    );
}
export default ThemeToggle
