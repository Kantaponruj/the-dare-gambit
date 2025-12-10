import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { useRouter } from "@tanstack/react-router";
import { useLoginMutation } from "../features/auth/useLoginMutation";
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Person,
  Lock,
} from "@mui/icons-material";
import {
  colors,
  typography,
  shadows,
  borderRadius,
} from "../design-system/tokens";
import { keyframes } from "@mui/system";

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

export function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLoginMutation({
    onSuccess: () => {
      // Mark authenticated for existing guards expecting this flag.
      localStorage.setItem("auth.loggedIn", "1");
      // After login, decide next step: if tournament already created go to hub else create-tournament
      if (localStorage.getItem("tournament.id")) {
        router.navigate({ to: "/" });
      } else {
        router.navigate({ to: "/setup" });
      }
    },
    onError: (err: any) => {
      setError(err?.message || "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    loginMutation.mutate({ username, password });
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: `
          radial-gradient(circle at 20% 50%, ${colors.primaryAlpha[20]}, transparent 50%),
          radial-gradient(circle at 80% 50%, ${colors.secondaryLight}33, transparent 50%),
          linear-gradient(180deg, ${colors.background.default} 0%, #0a0a0a 100%)
        `,
        backgroundSize: "200% 200%",
        animation: `${gradientShift} 15s ease infinite`,
        p: 2,
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            repeating-linear-gradient(90deg, ${colors.primary} 0px, transparent 1px, transparent 50px),
            repeating-linear-gradient(0deg, ${colors.secondary} 0px, transparent 1px, transparent 50px)
          `,
        }}
      />

      {/* Floating Glow Effects */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          bgcolor: colors.primary,
          opacity: 0.15,
          filter: "blur(100px)",
          animation: `${pulse} 4s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          right: "10%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          bgcolor: colors.secondary,
          opacity: 0.15,
          filter: "blur(100px)",
          animation: `${pulse} 5s ease-in-out infinite`,
        }}
      />

      {/* Login Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 480,
          bgcolor: "rgba(26, 26, 26, 0.8)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${colors.border.medium}`,
          borderRadius: borderRadius.xl / 8,
          boxShadow: shadows["2xl"],
          position: "relative",
          zIndex: 1,
          animation: `${fadeInUp} 0.8s ease-out`,
        }}
      >
        <Stack spacing={4}>
          {/* Header */}
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: colors.primaryAlpha[20],
                border: `2px solid ${colors.primary}`,
                mb: 3,
                boxShadow: shadows.glow.primary,
              }}
            >
              <LoginIcon sx={{ fontSize: 40, color: colors.primary }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: typography.fontWeight.bold,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              เข้าสู่ระบบ
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.text.secondary,
                fontSize: typography.fontSize.base,
              }}
            >
              The Dare Gambit Control Panel
            </Typography>
          </Box>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Username Field */}
              <TextField
                label="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                variant="outlined"
                autoComplete="username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: colors.text.tertiary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.background.elevated,
                    borderRadius: borderRadius.md / 8,
                    "&:hover": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.primaryAlpha[50],
                      },
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.primary,
                        borderWidth: 2,
                      },
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: colors.primary,
                  },
                }}
              />

              {/* Password Field */}
              <TextField
                label="รหัสผ่าน"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                variant="outlined"
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: colors.text.tertiary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: colors.text.tertiary }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.background.elevated,
                    borderRadius: borderRadius.md / 8,
                    "&:hover": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.primaryAlpha[50],
                      },
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.primary,
                        borderWidth: 2,
                      },
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: colors.primary,
                  },
                }}
              />

              {/* Error Message */}
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    bgcolor: colors.errorLight + "22",
                    border: `1px solid ${colors.error}`,
                    borderRadius: borderRadius.md / 8,
                    "& .MuiAlert-icon": {
                      color: colors.error,
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loginMutation.isPending}
                startIcon={loginMutation.isPending ? null : <LoginIcon />}
                sx={{
                  bgcolor: colors.primary,
                  color: colors.white,
                  fontSize: typography.fontSize.md,
                  fontWeight: typography.fontWeight.bold,
                  py: 1.5,
                  borderRadius: borderRadius.md / 8,
                  boxShadow: shadows.glow.primary,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: colors.primaryDark,
                    transform: "translateY(-2px)",
                    boxShadow: shadows.glow.primaryStrong,
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: colors.gray[700],
                    color: colors.text.disabled,
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {loginMutation.isPending
                  ? "กำลังเข้าสู่ระบบ..."
                  : "เข้าสู่ระบบ"}
              </Button>
            </Stack>
          </form>

          {/* Footer Info */}
          <Box sx={{ textAlign: "center", pt: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.tertiary,
                fontSize: typography.fontSize.sm,
              }}
            >
              ต้องการความช่วยเหลือ? ติดต่อผู้ดูแลระบบ
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
