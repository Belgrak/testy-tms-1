import React from "react";
import './App.css';
import {Navigate, Route, Routes} from "react-router-dom";
import Suites from "./components/testcases/suites.component";
import Project from "./components/projects/project";
import Header from "./components/header";
import Login from "./components/login"
import SelectionProject from "./components/projects/selection.project";
import NotExist from "./components/not-exist";
import TestplansComponent from "./components/testplans/testplans.component";
import AuthService from "./services/Authorization/auth.service";
import Profile from "./components/profile";
import {ColorModeContext, useMode} from "./context/ColorModeContextProvider";
import {ThemeProvider} from "@mui/material/styles";
import {CssBaseline} from "@mui/material";


function App() {
    const token = AuthService.getCurrentAccessToken()
    const [colorMode, theme] = useMode();
    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <div>
                    <Header/>
                    <Routes>
                        <Route path={"/login"} element={token ? <Navigate to="/"/> : <Login/>}/>
                        <Route path={"/"} element={token ? <SelectionProject/> : <Navigate to="/login"/>}/>
                        <Route path={"/project"} element={token ? <Project/> : <Navigate to="/login"/>}/>
                        <Route path={"/testcases"} element={token ? <Suites/> : <Navigate to="/login"/>}/>
                        <Route path={"/testcases/:selectedSuiteId"}
                               element={token ? <Suites/> : <Navigate to="/login"/>}/>
                        <Route path={"/profile"} element={token ? <Profile/> : <Navigate to="/login"/>}/>
                        <Route path={"/testplans"} element={token ? <TestplansComponent/> : <Navigate to="/login"/>}/>
                        <Route path={"/testplans/:testplanId"}
                               element={token ? <TestplansComponent/> : <Navigate to="/login"/>}/>
                        <Route path={"*"} element={token ? <NotExist/> : <Navigate to="/login"/>}/>
                    </Routes>
                </div>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default App;
