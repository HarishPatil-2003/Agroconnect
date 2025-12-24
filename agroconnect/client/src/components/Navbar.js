import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Box,
  Tooltip,
} from "@mui/material";
import {
  AccountCircle,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../utils/auth";

const Navbar = ({ mode, setMode }) => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(auth.getCurrentUser());
  }, []);

  const toggleTheme = () => {
    setMode(mode === "light" ? "dark" : "light");
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: "blur(10px)",
        background:
          mode === "dark"
            ? "rgba(15, 23, 42, 0.9)"
            : "rgba(255,255,255,0.9)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Toolbar sx={{ maxWidth: 1300, mx: "auto", width: "100%" }}>
        <Typography
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            fontWeight: 800,
            fontSize: "1.5rem",
            textDecoration: "none",
            color: "primary.main",
          }}
        >
          🌾 AgroConnect
        </Typography>

        <Tooltip title="Toggle theme">
          <IconButton onClick={toggleTheme}>
            {mode === "dark" ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        <Button component={Link} to="/bidding">Bidding</Button>
        <Button component={Link} to="/equipment">Equipment</Button>
        <Button component={Link} to="/guidance">Guidance</Button>

        {user ? (
          <>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
              <MenuItem onClick={() => navigate(`/${user.role}-dashboard`)}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button component={Link} to="/login">Login</Button>
            <Button component={Link} to="/register" variant="contained">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
