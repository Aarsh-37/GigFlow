import { createSlice } from '@reduxjs/toolkit';

// Get initial theme from localStorage or default to 'light'
const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    // Default to light if storedTheme is null or invalid
    if (!storedTheme || (storedTheme !== 'light' && storedTheme !== 'dark')) {
        return 'light';
    }
    return storedTheme;
};

const initialState = {
    mode: getInitialTheme(),
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            const newMode = state.mode === 'light' ? 'dark' : 'light';
            state.mode = newMode;
            localStorage.setItem('theme', newMode); // Persist theme to localStorage
        },
        // Optional: setTheme if you need to set a specific theme programmatically
        setTheme: (state, action) => {
            const newMode = action.payload;
            if (newMode === 'light' || newMode === 'dark') {
                state.mode = newMode;
                localStorage.setItem('theme', newMode);
            }
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
