import React, {useState} from "react";
import {ThemeProvider} from '@mui/material/styles';
import IconButton from "@mui/material/IconButton";
import {SelectChangeEvent} from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import {useTranslation} from "react-i18next";
import i18next from "i18next";
import {CssBaseline} from "@mui/material";
import {useMode} from "../context/ColorModeContextProvider";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Tooltip from "@mui/material/Tooltip";

const ColorModeContext = React.createContext({
    toggleColorMode: () => {
    }
});

const Settings: React.FC = () => {
    const {t, i18n} = useTranslation();

    const [colorMode, theme] = useMode();
    const changeMode = () => {
        colorMode.toggleColorMode();
        console.log(theme.palette.mode)
        localStorage.setItem("mode", (theme.palette.mode == "dark") ? "light" : "dark");
        window.location.reload();
    }

    const [language, setLanguage] = useState(i18next.language || "ru")

    const handleOnChangeLanguage = (event: SelectChangeEvent) => setLanguage(event.target.value)
    const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        i18n.changeLanguage(language).catch((e) => console.log(e));
        localStorage.setItem("mode", (theme.palette.mode != "dark") ? "light" : "dark");
    }

    return <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
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
                <Tooltip title={(theme.palette.mode == "dark" ? "Light" : "Dark") + " mode"}>
                    <IconButton sx={{ml: 1}} onClick={changeMode} color="inherit">
                        {theme.palette.mode === 'dark' ? <LightModeIcon/> : <DarkModeIcon/>}
                    </IconButton>
                </Tooltip>
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
            </form>
        </ThemeProvider>
    </ColorModeContext.Provider>
}

export default Settings;