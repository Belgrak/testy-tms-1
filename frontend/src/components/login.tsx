import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";
import useStyles from "../styles/styles";
import AuthService from "../services/Authorization/auth.service";
import Container from "@mui/material/Container";
import {Card, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {useTranslation} from "react-i18next";

const Login: React.FC = () => {
    const {t} = useTranslation();
    const classes = useStyles()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")

    const onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
    };

    const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    };

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        AuthService.login(username, password)
            .then(() => window.location.assign("/"))
            .catch(() => setMessage(t("login.error") ?? "Введен неверный логин или пароль"))
    }

    return (
        <Container component="main" maxWidth="xs">
            <Card className={classes.paperLogin}>
                <div className={classes.divLogin}>
                    <Typography component="h1" variant="h5">
                        {t("login.title")}
                    </Typography>
                    <form className={classes.formLogin}
                          onSubmit={handleLogin}
                    >
                        <TextField
                            className={classes.rootLogin}
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="login"
                            label={t("login.login")}
                            name="login"
                            autoComplete="on"
                            autoFocus
                            value={username}
                            onChange={onChangeUsername}
                        />
                        <TextField
                            className={classes.rootLogin}
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            autoComplete="on"
                            label={t("login.password")}
                            type="password"
                            id="password"
                            value={password}
                            onChange={onChangePassword}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submitLogin}
                        >
                            {t("login.submit")}
                        </Button>
                        {message && (
                            <div className="form-group">
                                <div className="alert alert-danger" role="alert">
                                    {message}
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </Card>
        </Container>
    )
}

export default Login