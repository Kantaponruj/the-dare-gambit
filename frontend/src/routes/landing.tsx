import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import {
  PlayArrow,
  EmojiEvents,
  People,
  Timer,
  Category,
  Leaderboard,
  Phone,
  Email,
  CheckCircle,
  ExpandMore,
  Star,
  Business,
  School,
  Celebration,
  SportsEsports,
  LiveTv,
  Tune,
  Groups,
} from "@mui/icons-material";
import { colors, spacing, typography, shadows } from "../design-system/tokens";
import { Grid, keyframes } from "@mui/system";

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

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
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

export const LandingPage: React.FC = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log("Contact form submitted:", contactForm);
    alert("ขอบคุณสำหรับความสนใจ! เราจะติดต่อกลับโดยเร็วที่สุด");
  };

  return (
    <Box
      sx={{ bgcolor: colors.background.default, color: colors.text.primary }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background: `
            radial-gradient(circle at 20% 50%, ${colors.primaryAlpha[20]}, transparent 50%),
            radial-gradient(circle at 80% 50%, ${colors.secondaryLight}33, transparent 50%),
            linear-gradient(180deg, ${colors.background.default} 0%, #0a0a0a 100%)
          `,
          backgroundSize: "200% 200%",
          animation: `${gradientShift} 15s ease infinite`,
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

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  animation: `${fadeInUp} 1s ease-out`,
                }}
              >
                <Chip
                  label="🎮 The Ultimate Gameshow Experience"
                  sx={{
                    bgcolor: colors.primaryAlpha[20],
                    color: colors.primary,
                    border: `1px solid ${colors.primary}`,
                    mb: { xs: 2, md: 3 },
                    fontSize: {
                      xs: typography.fontSize.sm,
                      md: typography.fontSize.md,
                    },
                    fontWeight: typography.fontWeight.semibold,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: {
                      xs: typography.fontSize["3xl"],
                      sm: typography.fontSize["4xl"],
                      md: typography.fontSize["6xl"],
                    },
                    fontWeight: typography.fontWeight.extrabold,
                    lineHeight: typography.lineHeight.tight,
                    mb: { xs: 2, md: 3 },
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  TRUTH or DARE
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: {
                      xs: typography.fontSize.lg,
                      sm: typography.fontSize.xl,
                      md: typography.fontSize["3xl"],
                    },
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    mb: { xs: 2, md: 3 },
                  }}
                >
                  สมัครเล่นเอง จัดเองได้ทันที ไม่ต้องรอทีมงาน
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: {
                      xs: typography.fontSize.base,
                      md: typography.fontSize.lg,
                    },
                    color: colors.text.secondary,
                    mb: { xs: 3, md: 5 },
                    lineHeight: typography.lineHeight.relaxed,
                  }}
                >
                  เลือกแพ็กเกจตามจำนวนคนที่เล่น สมัครสมาชิก รับ Game Code
                  แล้วเริ่มเล่นได้ทันที! พร้อม Tournament System, Real-time
                  Scoring, และ GM Control Panel ใช้งานง่าย ไม่ต้องติดตั้งอะไร
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{
                      bgcolor: colors.primary,
                      color: colors.white,
                      fontSize: {
                        xs: typography.fontSize.base,
                        md: typography.fontSize.lg,
                      },
                      fontWeight: typography.fontWeight.bold,
                      px: { xs: 3, md: 5 },
                      py: { xs: 1.5, md: 2 },
                      borderRadius: spacing.md / 8,
                      boxShadow: shadows.glow.primaryStrong,
                      width: { xs: "100%", sm: "auto" },
                      "&:hover": {
                        bgcolor: colors.primaryDark,
                        transform: "translateY(-2px)",
                        boxShadow: shadows["2xl"],
                      },
                      transition: "all 0.3s ease",
                    }}
                    href="/setup"
                  >
                    เริ่มใช้งานฟรี
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: colors.secondary,
                      color: colors.secondary,
                      fontSize: {
                        xs: typography.fontSize.base,
                        md: typography.fontSize.lg,
                      },
                      fontWeight: typography.fontWeight.bold,
                      px: { xs: 3, md: 5 },
                      py: { xs: 1.5, md: 2 },
                      borderRadius: spacing.md / 8,
                      width: { xs: "100%", sm: "auto" },
                      "&:hover": {
                        borderColor: colors.secondaryLight,
                        bgcolor: colors.secondaryLight + "22",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    href="#pricing"
                  >
                    ดูแพ็กเกจและราคา
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              <Box
                sx={{
                  animation: `${float} 3s ease-in-out infinite`,
                  position: "relative",
                  aspectRatio: "4/3",
                  bgcolor: colors.background.paper,
                  borderRadius: spacing.lg / 8,
                  boxShadow: shadows["2xl"],
                  border: `2px solid ${colors.primaryAlpha[30]}`,
                  overflow: "hidden",
                  p: 3,
                }}
              >
                {/* Mockup Interface */}
                <Box sx={{ display: "flex", gap: 2, height: "100%" }}>
                  {/* Mobile Player View */}
                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: colors.background.elevated,
                      borderRadius: spacing.md / 8,
                      p: 2,
                      border: `1px solid ${colors.border.medium}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        textAlign: "center",
                        color: colors.text.primary,
                        fontSize: "10px",
                      }}
                    >
                      Player Interface
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        bgcolor: colors.success,
                        borderRadius: spacing.sm / 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: colors.white,
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      TRUTH
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        bgcolor: colors.primary,
                        borderRadius: spacing.sm / 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: colors.white,
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      DARE
                    </Box>
                  </Box>
                  {/* Display Screen */}
                  <Box
                    sx={{
                      flex: 1.5,
                      bgcolor: colors.background.elevated,
                      borderRadius: spacing.md / 8,
                      p: 2,
                      border: `1px solid ${colors.border.medium}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        textAlign: "center",
                        color: colors.text.primary,
                        fontSize: "10px",
                        mb: 1,
                      }}
                    >
                      Display Screen
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <Box
                        sx={{
                          flex: 1,
                          bgcolor: colors.secondaryLight + "33",
                          p: 1,
                          borderRadius: spacing.sm / 8,
                          textAlign: "center",
                          fontSize: "10px",
                          color: colors.secondary,
                        }}
                      >
                        Team A: 150
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          bgcolor: colors.primaryAlpha[20],
                          p: 1,
                          borderRadius: spacing.sm / 8,
                          textAlign: "center",
                          fontSize: "10px",
                          color: colors.primary,
                        }}
                      >
                        Team B: 120
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        bgcolor: colors.primaryAlpha[10],
                        borderRadius: spacing.sm / 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: colors.primary,
                      }}
                    >
                      00:30
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    bgcolor: colors.primary,
                    opacity: 0.2,
                    filter: "blur(40px)",
                    animation: `${pulse} 2s ease-in-out infinite`,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12, bgcolor: colors.background.paper }} id="features">
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: "center",
              mb: { xs: 6, md: 8 },
              px: { xs: 2, md: 0 },
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: {
                  xs: typography.fontSize["2xl"],
                  sm: typography.fontSize["3xl"],
                  md: typography.fontSize["4xl"],
                },
                fontWeight: typography.fontWeight.bold,
                color: colors.primary,
                mb: { xs: 1.5, md: 2 },
              }}
            >
              ทำไมต้องเลือกเรา?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: {
                  xs: typography.fontSize.base,
                  md: typography.fontSize.lg,
                },
                color: colors.text.secondary,
                maxWidth: 700,
                mx: "auto",
              }}
            >
              ระบบเกมโชว์ที่ออกแบบมาเพื่อความสนุก ความเป็นมืออาชีพ
              และประสบการณ์ที่ไม่มีวันลืม
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {[
              {
                icon: <LiveTv sx={{ fontSize: 48 }} />,
                title: "Real-Time Multiplayer",
                description:
                  "เล่นพร้อมกันได้หลายทีม ทุกอย่างซิงค์แบบ Real-time ไม่มีดีเลย์",
                color: colors.primary,
              },
              {
                icon: <Tune sx={{ fontSize: 48 }} />,
                title: "ปรับแต่งได้อย่างอิสระ",
                description:
                  "เพิ่มคำถาม TRUTH และภารกิจ DARE ของคุณเองได้ตามต้องการ",
                color: colors.secondary,
              },
              {
                icon: <EmojiEvents sx={{ fontSize: 48 }} />,
                title: "Tournament System",
                description:
                  "ระบบทัวร์นาเม้นท์แบบชาร์ตอัตโนมัติ ตั้งแต่รอบแรกจนถึงแชมป์",
                color: colors.success,
              },
              {
                icon: <Leaderboard sx={{ fontSize: 48 }} />,
                title: "GM Control Panel",
                description:
                  "จัดการเกมแบบมืออาชีพด้วย Control Panel สำหรับ Game Master",
                color: colors.warning,
              },
              {
                icon: <Timer sx={{ fontSize: 48 }} />,
                title: "Live Scoring & Timer",
                description:
                  "ระบบให้คะแนนและจับเวลาแบบ Real-time แสดงผลบนจอใหญ่",
                color: colors.info,
              },
              {
                icon: <Groups sx={{ fontSize: 48 }} />,
                title: "Mobile-Friendly",
                description:
                  "ผู้เล่นใช้มือถือเข้าร่วมได้ทันที ไม่ต้องติดตั้งแอป",
                color: colors.primary,
              },
            ].map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    bgcolor: colors.background.elevated,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: spacing.lg / 8,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      borderColor: feature.color,
                      boxShadow: `0 0 30px ${feature.color}44`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Box sx={{ color: feature.color, mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: typography.fontWeight.bold,
                        color: colors.text.primary,
                        mb: 2,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        lineHeight: typography.lineHeight.relaxed,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: 12, bgcolor: colors.background.default }} id="pricing">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: typography.fontSize["4xl"],
                fontWeight: typography.fontWeight.bold,
                color: colors.primary,
                mb: 2,
              }}
            >
              เลือกแพ็กเกจที่เหมาะกับคุณ
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                mb: 1,
              }}
            >
              สมัครสมาชิกรายเดือน เล่นได้ไม่จำกัดตามจำนวนผู้เล่นที่รองรับ
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: typography.fontSize.sm,
                color: colors.text.tertiary,
              }}
            >
              * ยกเลิกได้ทุกเมื่อ ไม่มีค่าผูกมัด
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                name: "Free",
                price: "0",
                players: "สูงสุด 10 คน",
                popular: false,
                features: [
                  "สูงสุด 10 ผู้เล่นพร้อมกัน",
                  "ระบบเกมโชว์พื้นฐาน",
                  "GM Control Panel",
                  "Live Scoring & Display",
                  "Mobile Player Interface",
                  "50+ คำถามและภารกิจ",
                  "Community Support",
                ],
                color: colors.secondary,
                cta: "เริ่มใช้งานฟรี",
              },
              {
                name: "Starter",
                price: "299",
                players: "สูงสุด 30 คน",
                popular: false,
                features: [
                  "ทุกอย่างใน Free",
                  "สูงสุด 30 ผู้เล่นพร้อมกัน",
                  "200+ คำถามและภารกิจ",
                  "Custom คำถาม TRUTH & DARE",
                  "Tournament Bracket (2 ทีม)",
                  "Email Support",
                  "ไม่มีโฆษณา",
                ],
                color: colors.info,
                cta: "สมัครเลย",
              },
              {
                name: "Pro",
                price: "599",
                players: "สูงสุด 100 คน",
                popular: true,
                features: [
                  "ทุกอย่างใน Starter",
                  "สูงสุด 100 ผู้เล่นพร้อมกัน",
                  "500+ คำถามและภารกิจ",
                  "Tournament Bracket (8 ทีม)",
                  "Custom Branding (Logo & Theme)",
                  "Advanced Analytics",
                  "Priority Email Support",
                  "Export Score Report",
                ],
                color: colors.primary,
                cta: "สมัครเลย",
              },
              {
                name: "Enterprise",
                price: "1,299",
                players: "Unlimited",
                popular: false,
                features: [
                  "ทุกอย่างใน Pro",
                  "ผู้เล่นไม่จำกัด",
                  "Custom คำถามไม่จำกัด",
                  "Tournament Bracket ไม่จำกัด",
                  "White Label Solution",
                  "API Access",
                  "Dedicated Support",
                  "Custom Development",
                  "On-premises Deployment (optional)",
                ],
                color: colors.warning,
                cta: "ติดต่อเรา",
              },
            ].map((pkg, index) => (
              <Grid size={{ xs: 12, md: 3 }} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    bgcolor: pkg.popular
                      ? colors.primaryAlpha[10]
                      : colors.background.paper,
                    border: `2px solid ${
                      pkg.popular ? colors.primary : colors.border.light
                    }`,
                    borderRadius: spacing.lg / 8,
                    position: "relative",
                    overflow: "visible",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: `0 0 40px ${pkg.color}66`,
                    },
                  }}
                >
                  {pkg.popular && (
                    <Chip
                      label="แนะนำ"
                      icon={<Star />}
                      sx={{
                        position: "absolute",
                        top: -12,
                        right: 20,
                        bgcolor: colors.primary,
                        color: colors.white,
                        fontWeight: typography.fontWeight.bold,
                        boxShadow: shadows.glow.primary,
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: typography.fontWeight.bold,
                        color: pkg.color,
                        mb: 1,
                      }}
                    >
                      {pkg.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        display: "block",
                        mb: 3,
                      }}
                    >
                      {pkg.players}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: typography.fontSize["4xl"],
                          fontWeight: typography.fontWeight.extrabold,
                          color: colors.text.primary,
                          display: "inline",
                        }}
                      >
                        ฿{pkg.price}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.secondary,
                          ml: 1,
                        }}
                      >
                        {pkg.price === "0" ? "" : "/ เดือน"}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 3, borderColor: colors.border.light }} />
                    <Stack spacing={2} sx={{ mb: 4 }}>
                      {pkg.features.map((feature, i) => (
                        <Box
                          key={i}
                          sx={{ display: "flex", alignItems: "flex-start" }}
                        >
                          <CheckCircle
                            sx={{
                              color: pkg.color,
                              fontSize: 20,
                              mr: 1,
                              mt: 0.3,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.text.secondary,
                              lineHeight: typography.lineHeight.relaxed,
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Button
                      variant={pkg.popular ? "contained" : "outlined"}
                      fullWidth
                      size="large"
                      sx={{
                        bgcolor: pkg.popular ? colors.primary : "transparent",
                        color: pkg.popular ? colors.white : pkg.color,
                        borderColor: pkg.color,
                        fontWeight: typography.fontWeight.bold,
                        py: 1.5,
                        "&:hover": {
                          bgcolor: pkg.popular
                            ? colors.primaryDark
                            : `${pkg.color}22`,
                          borderColor: pkg.color,
                        },
                      }}
                      href={
                        pkg.name === "Free" ||
                        pkg.name === "Starter" ||
                        pkg.name === "Pro"
                          ? "/setup"
                          : "#contact"
                      }
                    >
                      {pkg.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Comparison note */}
          <Box sx={{ mt: 8, textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{
                color: colors.text.tertiary,
                maxWidth: 700,
                mx: "auto",
              }}
            >
              💡 <strong>เคล็ดลับ:</strong> เริ่มต้นด้วย Free เพื่อทดลองใช้งาน
              แล้วอัพเกรดเมื่อต้องการรองรับผู้เล่นมากขึ้น หรือต้องการ Custom
              Features เพิ่มเติม
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 12, bgcolor: colors.background.paper }} id="how-it-works">
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: "center",
              mb: { xs: 6, md: 8 },
              px: { xs: 2, md: 0 },
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: {
                  xs: typography.fontSize["2xl"],
                  sm: typography.fontSize["3xl"],
                  md: typography.fontSize["4xl"],
                },
                fontWeight: typography.fontWeight.bold,
                color: colors.primary,
                mb: { xs: 1.5, md: 2 },
              }}
            >
              เริ่มต้นอย่างไร?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: {
                  xs: typography.fontSize.base,
                  md: typography.fontSize.lg,
                },
                color: colors.text.secondary,
              }}
            >
              ง่ายๆ แค่ 3 ขั้นตอน
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 4, md: 6 }}>
            {[
              {
                step: "01",
                title: "สมัครสมาชิก",
                description:
                  "เลือกแพ็กเกจที่เหมาะกับจำนวนผู้เล่น สมัครสมาชิก รับ Game Code ทันที",
                icon: <People sx={{ fontSize: 40 }} />,
              },
              {
                step: "02",
                title: "สร้างเกม & เชิญผู้เล่น",
                description:
                  "ตั้งค่าเกม เลือกคำถาม สร้าง Tournament Bracket และแชร์ Game Code ให้ผู้เล่น",
                icon: <Category sx={{ fontSize: 40 }} />,
              },
              {
                step: "03",
                title: "เริ่มเล่นได้เลย!",
                description:
                  "ผู้เล่นเข้าเกมผ่านมือถือ GM ควบคุมเกมผ่าน Control Panel เริ่มเล่นได้ทันที!",
                icon: <SportsEsports sx={{ fontSize: 40 }} />,
              },
            ].map((item, index) => (
              <Grid size={{ xs: 12, sm: 4 }} key={index}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: colors.primaryAlpha[10],
                      border: `2px solid ${colors.primary}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: colors.primary,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: colors.text.tertiary,
                        fontSize: typography.fontSize.sm,
                        mb: 1,
                      }}
                    >
                      STEP {item.step}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: typography.fontWeight.bold,
                        color: colors.text.primary,
                        mb: 2,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        lineHeight: typography.lineHeight.relaxed,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Use Cases Section */}
      <Box sx={{ py: 12, bgcolor: colors.background.default }} id="use-cases">
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: "center",
              mb: { xs: 6, md: 10 },
              px: { xs: 2, md: 0 },
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: {
                  xs: typography.fontSize["2xl"],
                  sm: typography.fontSize["3xl"],
                  md: typography.fontSize["4xl"],
                },
                fontWeight: typography.fontWeight.bold,
                color: colors.primary,
                mb: { xs: 2, md: 3 },
              }}
            >
              เหมาะสำหรับทุกโอกาส
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                name: "Corporate Team Building",
                description:
                  "สร้างความสามัคคี เพิ่มความสัมพันธ์ในทีม พัฒนาทักษะการทำงานร่วมกัน",
                icon: <Business sx={{ fontSize: 60 }} />,
                color: colors.primary,
              },
              {
                name: "Educational Events",
                description:
                  "เรียนรู้แบบสนุกสนาน เพิ่มการมีส่วนร่วม จดจำได้ดีกว่าการบรรยาย",
                icon: <School sx={{ fontSize: 60 }} />,
                color: colors.secondary,
              },
              {
                name: "Party & Entertainment",
                description:
                  "ปาร์ตี้ วันเกิด งานเลี้ยง สร้างความสนุกและความทรงจำที่ยากจะลืม",
                icon: <Celebration sx={{ fontSize: 60 }} />,
                color: colors.success,
              },
              {
                name: "Competition & Tournament",
                description:
                  "จัดการแข่งขันระดับมืออาชีพ มีระบบ Bracket และ Scoring ที่เป็นธรรม",
                icon: <EmojiEvents sx={{ fontSize: 60 }} />,
                color: colors.warning,
              },
            ].map((useCase, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    bgcolor: colors.background.elevated,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: spacing.lg / 8,
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: useCase.color,
                      transform: "translateY(-8px)",
                      boxShadow: `0 0 30px ${useCase.color}44`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ color: useCase.color, mb: 2 }}>
                      {useCase.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: typography.fontWeight.bold,
                        color: colors.text.primary,
                        mb: 2,
                      }}
                    >
                      {useCase.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        lineHeight: typography.lineHeight.relaxed,
                      }}
                    >
                      {useCase.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 12, bgcolor: colors.background.paper }} id="faq">
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: "center",
              mb: { xs: 6, md: 10 },
              px: { xs: 2, md: 0 },
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: {
                  xs: typography.fontSize["2xl"],
                  sm: typography.fontSize["3xl"],
                  md: typography.fontSize["4xl"],
                },
                fontWeight: typography.fontWeight.bold,
                color: colors.primary,
                mb: { xs: 2, md: 3 },
              }}
            >
              แพ็กเกจและราคา
            </Typography>
          </Box>

          <Stack spacing={2}>
            {[
              {
                question: "ต้องมีอุปกรณ์อะไรบ้าง?",
                answer:
                  "เราจัดให้ครบ! รวมถึงจอแสดงผล, ระบบเสียง, อุปกรณ์ GM Control, และทุกอย่างที่จำเป็น คุณแค่เตรียมสถานที่และผู้เล่นให้พร้อม",
              },
              {
                question: "สามารถปรับแต่งคำถามได้ไหม?",
                answer:
                  "ได้แน่นอน! แพ็กเกจ Professional ขึ้นไป สามารถปรับแต่งคำถาม TRUTH และภารกิจ DARE ให้เหมาะกับธีมงานของคุณได้ 100%",
              },
              {
                question: "รองรับผู้เล่นสูงสุดกี่คน?",
                answer:
                  "ขึ้นอยู่กับแพ็กเกจที่เลือก Standard รองรับ 30 คน, Professional รองรับ 100 คน, และ Enterprise รองรับมากกว่า 100 คนขึ้นไป สามารถปรับได้ตามความต้องการ",
              },
              {
                question: "ต้องจองล่วงหน้ากี่วัน?",
                answer:
                  "แนะนำให้จองล่วงหน้าอย่างน้อย 7-14 วัน เพื่อให้เรามีเวลาเตรียมและปรับแต่งระบบให้เหมาะกับงานของคุณ สำหรับงานเร่งด่วนสามารถติดต่อสอบถามได้",
              },
              {
                question: "มีทีม Support ช่วยในวันงานไหม?",
                answer:
                  "มี! ทุกแพ็กเกจมีทีม Support และ GM อยู่ตลอดการจัดงาน แพ็กเกจ Professional ขึ้นไปจะมี Dedicated Support On-site ด้วย",
              },
              {
                question: "สามารถขอใบเสนอราคาได้ไหม?",
                answer:
                  "ได้เลยครับ! กรอกฟอร์มด้านล่างหรือติดต่อเราทาง LINE หรือโทร เราจะส่งใบเสนอราคาและรายละเอียดให้ภายใน 24 ชม.",
              },
            ].map((faq, index) => (
              <Accordion
                key={index}
                sx={{
                  bgcolor: colors.background.elevated,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: `${spacing.md / 8}px !important`,
                  "&:before": {
                    display: "none",
                  },
                  "&.Mui-expanded": {
                    borderColor: colors.primary,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: colors.primary }} />}
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      my: 2,
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text.secondary,
                      lineHeight: typography.lineHeight.relaxed,
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 12, bgcolor: colors.background.default }} id="contact">
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: typography.fontSize["4xl"],
                fontWeight: typography.fontWeight.bold,
                color: colors.primary,
                mb: 2,
              }}
            >
              พร้อมจะเริ่มต้นแล้วหรือยัง?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
              }}
            >
              ติดต่อเราวันนี้เพื่อรับคำปรึกษาฟรีและใบเสนอราคา
            </Typography>
          </Box>

          <Paper
            sx={{
              p: 6,
              bgcolor: colors.background.paper,
              border: `1px solid ${colors.border.light}`,
              borderRadius: spacing.lg / 8,
            }}
          >
            <form onSubmit={handleContactSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="ชื่อ-นามสกุล หรือชื่อบริษัท"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: colors.background.elevated,
                      "& fieldset": {
                        borderColor: colors.border.light,
                      },
                      "&:hover fieldset": {
                        borderColor: colors.primary,
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="อีเมล"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: colors.background.elevated,
                      "& fieldset": {
                        borderColor: colors.border.light,
                      },
                      "&:hover fieldset": {
                        borderColor: colors.primary,
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="เบอร์โทรศัพท์"
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, phone: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: colors.background.elevated,
                      "& fieldset": {
                        borderColor: colors.border.light,
                      },
                      "&:hover fieldset": {
                        borderColor: colors.primary,
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="รายละเอียดงาน (จำนวนคน, วัน/เวลา, สถานที่)"
                  multiline
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: colors.background.elevated,
                      "& fieldset": {
                        borderColor: colors.border.light,
                      },
                      "&:hover fieldset": {
                        borderColor: colors.primary,
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    bgcolor: colors.primary,
                    color: colors.white,
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    py: 2,
                    boxShadow: shadows.glow.primary,
                    "&:hover": {
                      bgcolor: colors.primaryDark,
                      boxShadow: shadows.glow.primaryStrong,
                    },
                  }}
                >
                  ส่งข้อความ
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 4, borderColor: colors.border.light }}>
              <Typography
                variant="caption"
                sx={{ color: colors.text.tertiary }}
              >
                หรือ
              </Typography>
            </Divider>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="outlined"
                startIcon={<Phone />}
                sx={{
                  borderColor: colors.secondary,
                  color: colors.secondary,
                  "&:hover": {
                    borderColor: colors.secondaryLight,
                    bgcolor: colors.secondaryLight + "22",
                  },
                }}
              >
                โทร: 02-XXX-XXXX
              </Button>
              <Button
                variant="outlined"
                startIcon={<Email />}
                sx={{
                  borderColor: colors.secondary,
                  color: colors.secondary,
                  "&:hover": {
                    borderColor: colors.secondaryLight,
                    bgcolor: colors.secondaryLight + "22",
                  },
                }}
              >
                LINE: @truthordare
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 6,
          bgcolor: colors.background.paper,
          borderTop: `1px solid ${colors.border.light}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.primary,
                  mb: 2,
                }}
              >
                TRUTH or DARE Gameshow
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: colors.text.secondary,
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                ระบบเกมโชว์แบบมืออาชีพสำหรับงานอีเว้นท์ทุกประเภท
                สร้างประสบการณ์ที่ไม่มีวันลืมให้กับทีมของคุณ
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: 2,
                }}
              >
                เมนู
              </Typography>
              <Stack spacing={1}>
                <Button
                  component={Link}
                  to="/setup"
                  sx={{
                    color: colors.text.secondary,
                    justifyContent: "flex-start",
                    pl: 0,
                    "&:hover": {
                      color: colors.primary,
                      bgcolor: "transparent",
                    },
                  }}
                >
                  เริ่มต้นใช้งาน
                </Button>
                <Button
                  component={Link}
                  to="/admin"
                  sx={{
                    color: colors.text.secondary,
                    justifyContent: "flex-start",
                    pl: 0,
                    "&:hover": {
                      color: colors.primary,
                      bgcolor: "transparent",
                    },
                  }}
                >
                  Admin Panel
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: 2,
                }}
              >
                ข้อมูล
              </Typography>
              <Stack spacing={1}>
                <Button
                  href="#features"
                  sx={{
                    color: colors.text.secondary,
                    justifyContent: "flex-start",
                    pl: 0,
                    "&:hover": {
                      color: colors.primary,
                      bgcolor: "transparent",
                    },
                  }}
                >
                  Features
                </Button>
                <Button
                  href="#pricing"
                  sx={{
                    color: colors.text.secondary,
                    justifyContent: "flex-start",
                    pl: 0,
                    "&:hover": {
                      color: colors.primary,
                      bgcolor: "transparent",
                    },
                  }}
                >
                  ราคา
                </Button>
                <Button
                  href="#faq"
                  sx={{
                    color: colors.text.secondary,
                    justifyContent: "flex-start",
                    pl: 0,
                    "&:hover": {
                      color: colors.primary,
                      bgcolor: "transparent",
                    },
                  }}
                >
                  FAQ
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: 2,
                }}
              >
                ติดต่อเรา
              </Typography>
              <Stack spacing={1}>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary }}
                >
                  📞 โทร: 02-XXX-XXXX
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary }}
                >
                  📧 Email: info@truthordare.com
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary }}
                >
                  💬 LINE: @truthordare
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: colors.border.light }} />
          <Typography
            variant="caption"
            sx={{
              color: colors.text.tertiary,
              display: "block",
              textAlign: "center",
            }}
          >
            © 2025 TRUTH or DARE Gameshow. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
