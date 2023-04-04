import React from "react";
import {createTheme} from "@mui/material/styles";

export const ColorModeContext = React.createContext({
    toggleColorMode: () => {
    }
});

export const useMode = () => {
    const [mode, setMode] = React.useState<'light' | 'dark'>((localStorage.getItem("mode") != "dark") ? "light" : "dark");
    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );
    const theme: any = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode],
    );
    return [colorMode, theme]
}
