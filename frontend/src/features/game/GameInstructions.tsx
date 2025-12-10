import React from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  Paper,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import StarIcon from "@mui/icons-material/Star";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import TimerIcon from "@mui/icons-material/Timer";

interface GameInstructionsProps {
  open: boolean;
  onClose: () => void;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#1a1a1a",
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(255, 138, 0, 0.1), transparent 50%),
            linear-gradient(180deg, rgba(26, 26, 26, 1) 0%, rgba(10, 10, 10, 1) 100%)
          `,
          border: "2px solid rgba(255, 138, 0, 0.3)",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid rgba(255, 138, 0, 0.3)",
          pb: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#ff8a00",
            fontWeight: 700,
            fontSize: { xs: "1.5rem", sm: "2rem" },
          }}
        >
          🎮 วิธีการเล่น TRUTH or DARE
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, color: "#fff" }}>
        {/* Game Overview */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <PeopleIcon sx={{ color: "#ff8a00", mr: 1, fontSize: "2rem" }} />
            <Typography variant="h5" sx={{ color: "#ff8a00", fontWeight: 700 }}>
              ภาพรวมเกม
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.8 }}
          >
            TRUTH or DARE เป็นเกมแข่งขันแบบทีม
            ที่ทดสอบความรู้และความกล้าของผู้เล่น
            โดยในแต่ละรอบทีมจะได้เลือกหมวดหมู่และระดับความยากของคำถาม
            จากนั้นจะได้รับการ์ดที่เป็น TRUTH (คำถาม) หรือ DARE (ภารกิจ)
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255, 138, 0, 0.3)", my: 3 }} />

        {/* Card Types */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CategoryIcon sx={{ color: "#ff8a00", mr: 1, fontSize: "2rem" }} />
            <Typography variant="h5" sx={{ color: "#ff8a00", fontWeight: 700 }}>
              ประเภทการ์ด
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {/* TRUTH Card */}
            <Box sx={{ flex: 1 }}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "rgba(76, 175, 80, 0.1)",
                  border: "2px solid #4caf50",
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <EmojiObjectsIcon
                    sx={{ color: "#4caf50", fontSize: "2rem", mr: 1 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ color: "#4caf50", fontWeight: 700 }}
                  >
                    TRUTH (ความจริง)
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#fff", mb: 2 }}>
                  การ์ดคำถามที่ทีมต้องตอบให้ถูกต้อง
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  💡 ตัวอย่าง: คำถามเกี่ยวกับความรู้ทั่วไป วิทยาศาสตร์
                  ประวัติศาสตร์ ฯลฯ
                </Typography>
              </Paper>
            </Box>

            {/* DARE Card */}
            <Box sx={{ flex: 1 }}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "rgba(255, 138, 0, 0.1)",
                  border: "2px solid #ff8a00",
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <SportsKabaddiIcon
                    sx={{ color: "#ff8a00", fontSize: "2rem", mr: 1 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ color: "#ff8a00", fontWeight: 700 }}
                  >
                    DARE (ความท้าทาย)
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#fff", mb: 2 }}>
                  ภารกิจท้าทายที่ต้องทำให้สำเร็จ หรือท้าให้อีกทีมทำ
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  💡 ตัวอย่าง: ร้องเพลง เต้น แสดงท่าทาง ทำกิจกรรมต่างๆ
                </Typography>
              </Paper>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "rgba(255, 138, 0, 0.3)", my: 3 }} />

        {/* Scoring System */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <StarIcon sx={{ color: "#ff8a00", mr: 1, fontSize: "2rem" }} />
            <Typography variant="h5" sx={{ color: "#ff8a00", fontWeight: 700 }}>
              การให้คะแนน
            </Typography>
          </Box>

          {/* TRUTH Scoring */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              bgcolor: "rgba(76, 175, 80, 0.05)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: "#4caf50", fontWeight: 700, mb: 1 }}
            >
              📝 การ์ด TRUTH
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ color: "#fff", mb: 0.5 }}>
                ✅ ตอบถูก: <strong>ได้คะแนนเต็ม 100%</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#fff" }}>
                ❌ ตอบผิด: <strong>ได้ 0 คะแนน</strong>
              </Typography>
            </Box>
          </Paper>

          {/* DARE Scoring */}
          <Paper
            sx={{
              p: 2,
              bgcolor: "rgba(255, 138, 0, 0.05)",
              border: "1px solid rgba(255, 138, 0, 0.3)",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: "#ff8a00", fontWeight: 700, mb: 1 }}
            >
              🎯 การ์ด DARE
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.8)",
                mb: 1,
                fontStyle: "italic",
              }}
            >
              ทีมสามารถเลือกได้ 2 ทาง:
            </Typography>

            {/* Self-Play */}
            <Box sx={{ pl: 2, mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "#4caf50", fontWeight: 700, mb: 0.5 }}
              >
                1️⃣ เล่นเอง (TRUTH)
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ color: "#fff", mb: 0.5 }}>
                  ✅ ทำสำเร็จ: <strong>ได้คะแนนเต็ม 100%</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  ❌ ทำไม่สำเร็จ: <strong>ได้ 0 คะแนน</strong>
                </Typography>
              </Box>
            </Box>

            {/* Challenge */}
            <Box sx={{ pl: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "#ff8a00", fontWeight: 700, mb: 0.5 }}
              >
                2️⃣ ท้าอีกทีม (DARE)
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ color: "#fff", mb: 0.5 }}>
                  ✅ อีกทีมทำสำเร็จ: <strong>อีกทีมได้ 50% คะแนน</strong> |
                  คุณได้ 0
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  ❌ อีกทีมทำไม่สำเร็จ: <strong>คุณได้ 50% คะแนน</strong> |
                  อีกทีมได้ 0
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ borderColor: "rgba(255, 138, 0, 0.3)", my: 3 }} />

        {/* Game Flow */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TimerIcon sx={{ color: "#ff8a00", mr: 1, fontSize: "2rem" }} />
            <Typography variant="h5" sx={{ color: "#ff8a00", fontWeight: 700 }}>
              ขั้นตอนการเล่น
            </Typography>
          </Box>

          <Box sx={{ pl: 2 }}>
            <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
              <strong style={{ color: "#ff8a00" }}>1.</strong>{" "}
              ทีมเลือกหมวดหมู่และระดับความยาก
            </Typography>
            <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
              <strong style={{ color: "#ff8a00" }}>2.</strong> ระบบสุ่มการ์ด
              (TRUTH หรือ DARE)
            </Typography>
            <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
              <strong style={{ color: "#ff8a00" }}>3.</strong> ถ้าได้ DARE
              ต้องเลือกว่าจะเล่นเองหรือท้าอีกทีม
            </Typography>
            <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
              <strong style={{ color: "#ff8a00" }}>4.</strong>{" "}
              ทำภารกิจหรือตอบคำถามภายในเวลาที่กำหนด
            </Typography>
            <Typography variant="body1" sx={{ color: "#fff", mb: 1 }}>
              <strong style={{ color: "#ff8a00" }}>5.</strong> GM
              ตัดสินและให้คะแนน
            </Typography>
            <Typography variant="body1" sx={{ color: "#fff" }}>
              <strong style={{ color: "#ff8a00" }}>6.</strong>{" "}
              สลับเทิร์นไปยังทีมถัดไป
            </Typography>
          </Box>
        </Box>

        {/* Tips */}
        <Paper
          sx={{
            p: 2,
            mt: 3,
            bgcolor: "rgba(33, 150, 243, 0.1)",
            border: "1px solid rgba(33, 150, 243, 0.3)",
            borderRadius: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ color: "#2196f3", fontWeight: 700, mb: 1 }}
          >
            💡 เคล็ดลับ
          </Typography>
          <Typography variant="body2" sx={{ color: "#fff", mb: 0.5 }}>
            • เลือกระดับความยากที่เหมาะสมกับทีม - ยากขึ้น = คะแนนมากขึ้น
          </Typography>
          <Typography variant="body2" sx={{ color: "#fff", mb: 0.5 }}>
            • การท้าทายคู่แข่งเป็นกลยุทธ์ที่ดีเมื่อคิดว่าพวกเขาจะทำไม่ได้
          </Typography>
          <Typography variant="body2" sx={{ color: "#fff" }}>
            • ทำงานเป็นทีม! หารือกันก่อนเลือกหมวดหมู่และตอบคำถาม
          </Typography>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};
