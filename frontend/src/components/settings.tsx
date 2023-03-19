import React, {useState} from "react";
import {ThemeProvider, createTheme} from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import IconButton from "@mui/material/IconButton";
import {SelectChangeEvent} from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import {useTranslation} from "react-i18next";
import i18next from "i18next";

const ColorModeContext = React.createContext({
    toggleColorMode: () => {
    }
});

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [mode, setMode] = React.useState<'light' | 'dark'>('light');
    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode],
    );

    const [language, setLanguage] = useState(i18next.language || "ru")

    const handleOnChangeLanguage = (event: SelectChangeEvent<string>) => setLanguage(event.target.value)
    const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        i18n.changeLanguage(language).catch((e) => console.log(e))
    }

    return <ColorModeContext.Provider value={colorMode}>
        <Typography color={"darkorange"} component={"h3"}>{t("settings.coming_soon")}</Typography>
        <form
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                margin: 1,
                minWidth: 200
            }}
        onSubmit={handleOnSubmit}>
            <InputLabel>{t("settings.lang")}</InputLabel>
            <Select
                autoWidth
                label="Язык интерфейса"
                value={language}
                onChange={handleOnChangeLanguage}
            >
                <MenuItem value={"ru"}>Русский</MenuItem>
                <MenuItem value={"en"}>English</MenuItem>
            </Select>
            <Button type={"submit"} variant={"contained"}
                    sx={{margin: '10px 10px 10px 10px'}}>{t("settings.save")}</Button>
            {/*<ThemeProvider theme={theme}>*/}
            {/*    <Box*/}
            {/*        sx={{*/}
            {/*            display: 'flex',*/}
            {/*            width: '100%',*/}
            {/*            alignItems: 'center',*/}
            {/*            justifyContent: 'center',*/}
            {/*            bgcolor: 'background.default',*/}
            {/*            color: 'text.primary',*/}
            {/*            borderRadius: 1,*/}
            {/*            p: 3,*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        {theme.palette.mode} mode*/}
            {/*        <IconButton sx={{ml: 1}} onClick={colorMode.toggleColorMode} color="inherit">*/}
            {/*            {theme.palette.mode === 'dark' ? <Brightness7Icon/> : <Brightness4Icon/>}*/}
            {/*        </IconButton>*/}
            {/*    </Box>*/}
            {/*    */}
            {/*</ThemeProvider>*/}
        </form>
    </ColorModeContext.Provider>
}

export default Settings;