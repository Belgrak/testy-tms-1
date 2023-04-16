import React from "react";
import {createTheme} from "@mui/material/styles";
import {brown, green, grey, red} from "@mui/material/colors";

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
                    ...(mode === 'light'
                        ? {
                            // palette values for light mode
                            greyButton: grey[700],
                            darkGreyButton: grey[800],
                            lightButton: grey[50],
                            passed: '#27e727',
                            failed: '#bd2828',
                            skipped: '#ddba99',
                            broken: '#602c13',
                            blocked: '#6c6c6c',
                            untested: '#a5a4a4',
                            retest: '#ded312',
                            rightDialogPart: "#eeeeee"
                        }
                        : {
                            // palette values for dark mode
                            greyButton: grey[500],
                            darkGreyButton: grey[400],
                            lightButton: grey[800],
                            passed: green[800],
                            failed: red[900],
                            skipped: '#b38f6e',
                            broken: brown[500],
                            blocked: grey[700],
                            untested: grey[500],
                            retest: '#989110',
                            rightDialogPart: "#000000"
                        }),
                },
            }),
        [mode],
    );
    return [colorMode, theme]
}
