import React from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Slide,
  Zoom,
} from "@mui/material";
import {
  BookOpen,
  Users,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  CreditCard,
  TrendingUp,
  School,
  CheckCircle,
  Zap,
  HelpCircle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES } from "@constants";
import campusWorksLottie from "./campusWorks_lottie.json";
import HowItWorksCarousel from "../components/ui/how-it-works-carousel";
import CampusWorksLogo from "../assets/images/logo_campusworks.png";

/** CampusWorks Academic Task Outsourcing Landing Page */

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleGetStarted = () => {
    navigate(ROUTES.REGISTER);
  };

  const handleLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  const handleRegister = () => {
    navigate(ROUTES.REGISTER);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };


  const stats = [
    { label: "Tasks Completed", value: "5K+", color: "#20b2aa" },
    { label: "Students Helped", value: "3K+", color: "#008b8b" },
    { label: "Success Rate", value: "97%", color: "#2c3e50" },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fffe' }}>
      {/* Navigation */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid #20b2aa`,
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0,
                  mr: 4,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Box
                  component="img"
                  src={CampusWorksLogo}
                  alt="CampusWorks Logo"
                  sx={{
                    height: { xs: 67, md: 80 },
                    width: 'auto',
                    objectFit: 'contain',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    display: 'block',
                    maxWidth: '100%',
                    verticalAlign: 'middle',
                    // Remove any potential box styling
                    boxShadow: 'none',
                    borderRadius: 0,
                    padding: 0,
                    margin: 0,
                    alignSelf: 'center',
                  }}
                />
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  color="#2c3e50"
                  sx={{
                    marginLeft: '-20px',
                    zIndex: 1,
                    position: 'relative'
                  }}
                >
                  ampusWorks
                </Typography>
              </Box>
            </Link>
            
            {!isMobile && (
              <Stack direction="row" spacing={4}>
                {[
                  { name: 'How it Works', id: 'how-it-works' },
                  { name: 'About', id: 'about' }
                ].map((item) => (
                  <Typography
                    key={item.name}
                    variant="body2"
                    color="#5a6c7d"
                    onClick={() => scrollToSection(item.id)}
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { color: '#20b2aa' },
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {item.name}
                  </Typography>
                ))}
              </Stack>
            )}
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="text"
              onClick={handleLogin}
              sx={{ color: '#2c3e50' }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={handleRegister}
              endIcon={<ArrowRight size={16} />}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #20b2aa 30%, #008b8b 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1a9b93 30%, #007a7a 90%)',
                },
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <Box>
                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight="bold"
                  color="#2c3e50"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    lineHeight: 1.1,
                    mb: 3,
                    background: 'linear-gradient(45deg, #20b2aa, #008b8b, #2c3e50)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Get academic help
                  <br />
                  from your peers
                </Typography>
                
                <Typography
                  variant="h6"
                  color="#5a6c7d"
                  sx={{ mb: 4, maxWidth: 500, lineHeight: 1.6 }}
                >
                  Join thousands of students who use <strong style={{ color: '#20b2aa' }}>CampusWorks</strong> for 
                  peer-to-peer academic task outsourcing with secure payments and real-time communication.
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 6 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    endIcon={<ArrowRight size={20} />}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #20b2aa 30%, #008b8b 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1a9b93 30%, #007a7a 90%)',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleLogin}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#20b2aa',
                      color: '#20b2aa',
                      '&:hover': {
                        borderColor: '#1a9b93',
                        backgroundColor: 'rgba(32, 178, 170, 0.1)',
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>

                {/* Stats */}
                <Grid container spacing={4} sx={{ mb: 4 }}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        <Box textAlign="center">
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            color={stat.color}
                            sx={{ mb: 0.5 }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="#5a6c7d">
                            {stat.label}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                {/* Trust indicators */}
                <Box sx={{ opacity: 0.7 }}>
                  <Typography variant="caption" color="#5a6c7d" sx={{ mb: 1, display: 'block' }}>
                    TRUSTED BY STUDENTS
                  </Typography>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Chip label="RGUKT" size="small" sx={{ bgcolor: '#e0f7fa', color: '#20b2aa' }} />
                    <Chip label="Universities" size="small" sx={{ bgcolor: '#e0f7fa', color: '#20b2aa' }} />
                    <Chip label="Colleges" size="small" sx={{ bgcolor: '#e0f7fa', color: '#20b2aa' }} />
                  </Stack>
                </Box>
              </Box>
            </Fade>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {/* Lottie Animation */}
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Lottie
                  animationData={campusWorksLottie}
                  style={{ width: 300, height: 300 }}
                  loop={true}
                  autoplay={true}
                />
              </Box>

              <Grid container spacing={3}>
                {/* Secure Payment Card */}
                <Grid item xs={12} sm={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card
                      sx={{
                        height: 200,
                        background: 'linear-gradient(135deg, #20b2aa 0%, #008b8b 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: '50%',
                                bgcolor: alpha(theme.palette.common.white, 0.2),
                              }}
                            >
                              <ShieldCheck size={20} />
                            </Box>
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                              Secure Payments
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            UPI ID integration
                            <br />
                            keeps your money safe
                          </Typography>
                        </Box>
                        <motion.div
                          animate={{ 
                            boxShadow: [
                              '0 0 0 0 rgba(25, 118, 210, 0.4)',
                              '0 0 0 20px rgba(25, 118, 210, 0)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: alpha(theme.palette.common.white, 0.3),
                          }}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* Academic Subjects Card */}
                <Grid item xs={12} sm={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card
                      sx={{
                        height: 200,
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8, mb: 1, display: 'block' }}>
                            Academic Subjects
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            Programming, Math,
                            <br />
                            Writing & More
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            opacity: 0.3,
                          }}
                        >
                          <School size={80} />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* Platform Growth Card */}
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card sx={{ height: 150 }}>
                      <CardContent sx={{ height: '100%' }}>
                        <Typography variant="body2" color="#5a6c7d" sx={{ mb: 1 }}>
                          Platform Growth Rate
                        </Typography>
                       
                        <Typography variant="body2" color="#20b2aa" sx={{ mb: 2 }}>
                          ↑ 15% this month
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'end', height: 40 }}>
                          {[18, 48, 72, 96].map((height, index) => (
                            <motion.div
                              key={index}
                              initial={{ height: 0, opacity: 0.6 }}
                              animate={{ height: height * 0.3 }}
                              transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                              style={{
                                width: 20,
                                backgroundColor: '#20b2aa',
                                borderRadius: 4,
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section - Carousel Style */}
      <Box id="how-it-works" sx={{ bgcolor: 'white', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="h3" fontWeight="bold" color="#2c3e50" sx={{ mb: 2 }}>
              How It Works
            </Typography>
            <Typography variant="h6" color="#5a6c7d" sx={{ maxWidth: 600, mx: 'auto' }}>
              Simple 3-step process to get academic help
            </Typography>
          </Box>

          {/* Carousel Container */}
          <Box sx={{ px: { xs: 2, md: 0 } }}>
            <HowItWorksCarousel />
          </Box>
        </Container>
      </Box>

      {/* About Section */}
      <Box id="about" sx={{ bgcolor: '#f8fffe', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
                  <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
              >
                <Typography variant="h3" fontWeight="bold" color="#2c3e50" sx={{ mb: 3 }}>
                  About CampusWorks
                </Typography>
                <Typography variant="h6" color="#5a6c7d" sx={{ mb: 3, lineHeight: 1.6 }}>
                  CampusWorks was born from the simple idea that students learn best from each other. 
                  We believe that peer-to-peer learning creates stronger academic communities and 
                  helps students develop both academically and professionally.
                </Typography>
                <Typography variant="body1" color="#5a6c7d" sx={{ mb: 4, lineHeight: 1.7 }}>
                  Our platform connects students who need help with those who can provide it, 
                  powered by secure UPI ID payments for instant, hassle-free transactions. Whether you're struggling 
                  with a complex assignment or looking to earn money by sharing your knowledge, 
                  CampusWorks is here to support your academic journey.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleGetStarted}
                    sx={{
                      bgcolor: '#20b2aa',
                      '&:hover': { bgcolor: '#1a9b93' },
                    }}
                  >
                    Join Now
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => scrollToSection('how-it-works')}
                      sx={{
                      borderColor: '#20b2aa',
                      color: '#20b2aa',
                        '&:hover': {
                        borderColor: '#1a9b93',
                        bgcolor: 'rgba(32, 178, 170, 0.1)',
                        },
                      }}
                    >
                    Learn More
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                        <Box
                          sx={{
                    bgcolor: 'white',
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 3,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" color="#20b2aa" sx={{ mb: 2 }}>
                    Our Mission
                  </Typography>
                  <Typography variant="body1" color="#5a6c7d" sx={{ mb: 3 }}>
                    To democratize academic support by creating a platform where every student 
                    can both give and receive help, fostering a collaborative learning environment.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold" color="#20b2aa">
                        10K+
                      </Typography>
                      <Typography variant="body2" color="#5a6c7d">
                        Tasks Completed
                          </Typography>
                        </Box>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold" color="#20b2aa">
                        5K+
                      </Typography>
                      <Typography variant="body2" color="#5a6c7d">
                        Students Helped
                      </Typography>
                        </Box>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold" color="#20b2aa">
                        97%
                        </Typography>
                      <Typography variant="body2" color="#5a6c7d">
                        Success Rate
                        </Typography>
                    </Box>
                  </Box>
                          </Box>
                  </motion.div>
                </Grid>
            </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ background: 'linear-gradient(135deg,rgb(82, 165, 161) 0%,rgb(77, 151, 151) 100%)', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box textAlign="center" color="white">
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
                Ready to Get Started?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                Join thousands of students who are already using CampusWorks to get academic help 
                and earn money by helping others.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mt: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  endIcon={<ArrowRight size={20} />}
                  sx={{
                    bgcolor: 'white',
                    color: '#20b2aa',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Start Posting Tasks
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLogin}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Already have an account? Login
                </Button>
              </Stack>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'white', py: 4, borderTop: '1px solid #e0f7fa' }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="body2" color="#5a6c7d">
              © {new Date().getFullYear()} CampusWorks. All rights reserved BY MANISH REDDY. 
              Built for students.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}