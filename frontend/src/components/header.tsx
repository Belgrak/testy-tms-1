import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {NotificationsActive} from "@mui/icons-material";
import AuthService from "../services/Authorization/auth.service";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import {useMode} from "../context/ColorModeContextProvider";
import {Icon} from "@mui/material";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

const Header: React.FC = () => {
    const [colorMode, theme] = useMode();
    const {t} = useTranslation();
    const navigate = useNavigate()
    const changeMode = () => {
        colorMode.toggleColorMode();
        console.log(theme.palette.mode)
        localStorage.setItem("mode", (theme.palette.mode == "dark") ? "light" : "dark");
        window.location.reload();
    }

    const buttons = [[t("header.cases"), "/testcases"], [t("header.test_plans"), "/testplans"]];
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseNavMenuAndNavigate = (href: string) => {
        setAnchorElNav(null);
        navigate(href);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleCloseUserMenuAndNavigate = (href: string) => {
        setAnchorElUser(null);
        navigate(href);
    };

    const handleLogout = () => {
        AuthService.logout()
    };

    const isProjectOpen = window.location.pathname !== '/' && window.location.pathname !== '/login';

    const buttonsAtNavBar = () => {
        if (isProjectOpen) {
            return (
                buttons.map(([button_name, path], index) => (
                    <Button
                        key={index}
                        sx={{
                            color: 'white',
                            fontWeight: 600
                        }}
                        href={path}
                    >
                        {button_name}
                    </Button>
                )))
        }
    }

    return (
        <AppBar position="static" sx={{
            backgroundColor: "#2b2765"
        }}>
            <Container>
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 0,
                            display: {xs: 'none', md: 'flex'},
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        TestY
                    </Typography>
                    <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>
                        {isProjectOpen && <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon/>
                        </IconButton>}
                        {isProjectOpen && <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={anchorElNav != null}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: {xs: 'block', md: 'none'},
                            }}
                        >
                            <MenuItem onClick={() => handleCloseNavMenuAndNavigate("/testcases")}>
                                <Typography
                                    textAlign="center"
                                    sx={{
                                        color: 'inherit',
                                        textDecoration: 'none',
                                    }}
                                >
                                    {t("header.cases")}
                                </Typography>
                            </MenuItem>
                            <MenuItem onClick={() => handleCloseNavMenuAndNavigate("/testplans")}>
                                <Typography
                                    textAlign="center"
                                    sx={{
                                        color: 'inherit',
                                        textDecoration: 'none',
                                    }}>
                                    {t("header.test_plans")}
                                </Typography>
                            </MenuItem>
                        </Menu>}
                    </Box>
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: {xs: 'flex', md: 'none'},
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        TestY
                    </Typography>
                    <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}, justifyContent: "center"}}>
                        <React.Fragment>
                            {buttonsAtNavBar()}
                        </React.Fragment>
                    </Box>

                    {window.location.pathname !== '/login' && <Box sx={{flexGrow: 0}}>
                        <Tooltip title={t("header.notifications")}>
                            <IconButton>
                                <NotificationsActive sx={{mr: 2, color: 'white'}}/>
                            </IconButton>
                        </Tooltip>
                        <IconButton onClick={handleOpenUserMenu}>
                            <AccountCircleIcon sx={{color: 'white'}}/>
                        </IconButton>
                        <Menu
                            sx={{mt: '45px'}}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={anchorElUser != null}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem key={"Профиль"} onClick={() =>
                                handleCloseUserMenuAndNavigate("/profile")
                            }>
                                <Typography
                                    textAlign="center"
                                    sx={{
                                        color: 'inherit',
                                        textDecoration: 'none',
                                    }}
                                > {t("header.profile")} </Typography>
                            </MenuItem>
                            <MenuItem key={"Выйти"} onClick={handleLogout}>
                                <Typography
                                    data-cy="logout"
                                    textAlign="center"
                                    component="a"
                                    href={"/login"}
                                    sx={{
                                        color: 'inherit',
                                        textDecoration: 'none',
                                    }}
                                > {t("header.logout")} </Typography>
                            </MenuItem>
                            <Divider/>
                            <MenuItem onClick={changeMode}>
                                <Stack direction={"row"} alignItems={'center'} justifyContent={"center"}>
                                    {theme.palette.mode === 'dark' ? t("settings.light") : t("settings.dark")} {t("settings.theme")}
                                    <Icon style={{margin: "0px 0px 0px 10px"}}>
                                        {theme.palette.mode === 'dark' ? <LightModeIcon/> : <DarkModeIcon/>}
                                    </Icon>
                                </Stack>
                            </MenuItem>
                        </Menu>
                    </Box>}
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Header;