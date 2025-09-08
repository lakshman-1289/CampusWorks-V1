import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, TrendingUp, CheckCircle, MessageCircle, ShieldCheck, School } from "lucide-react";
import { Box, Button, Typography, Card, CardContent, useMediaQuery, useTheme } from "@mui/material";
import "./carousel.css";

const HowItWorksCarousel = () => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const steps = [
    {
      number: "01",
      title: "Post Your Task",
      description: "Describe your academic task, set a budget, and specify requirements. Our platform makes it easy to get started.",
      icon: <BookOpen size={24} />,
    },
    {
      number: "02",
      title: "Students Bid",
      description: "Fellow students place competitive bids. Our system automatically selects the lowest bidder for you.",
      icon: <TrendingUp size={24} />,
    },
    {
      number: "03",
      title: "Get Help & Pay",
      description: "Work is completed, you review the quality, and payment is processed securely through UPI ID.",
      icon: <CheckCircle size={24} />,
    },
    {
      number: "04",
      title: "Track Progress",
      description: "Monitor your task progress in real-time with live updates and direct communication with your helper.",
      icon: <MessageCircle size={24} />,
    },
    {
      number: "05",
      title: "Quality Review",
      description: "Review the completed work, request revisions if needed, and ensure it meets your academic standards.",
      icon: <ShieldCheck size={24} />,
    },
    {
      number: "06",
      title: "Earn & Learn",
      description: "Help other students with their tasks to earn money while building your own academic skills and portfolio.",
      icon: <School size={24} />,
    },
  ];

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
      
      // Update current index based on scroll position
      const cardWidth = isMobile ? 280 : 320;
      const gap = 24;
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      setCurrentIndex(Math.min(newIndex, steps.length - 1));
    }
  };

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      const cardWidth = isMobile ? 280 : 320;
      const gap = 24; // 3 * 8px gap
      const scrollAmount = cardWidth + gap;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      const cardWidth = isMobile ? 280 : 320;
      const gap = 24; // 3 * 8px gap
      const scrollAmount = cardWidth + gap;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkScrollability();
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Carousel Container */}
      <Box
        ref={carouselRef}
        onScroll={checkScrollability}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          py: 2,
          gap: 3,
          px: { xs: 1, md: 0 },
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          // Add subtle gradient fade at edges
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '20px',
            background: 'linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))',
            zIndex: 1,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '20px',
            background: 'linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))',
            zIndex: 1,
            pointerEvents: 'none',
          },
        }}
      >
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.15, 
              duration: 0.6,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            viewport={{ once: true }}
            style={{ flexShrink: 0, width: isMobile ? '280px' : '320px' }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <Card
              sx={{
                height: isMobile ? 350 : 400,
                p: isMobile ? 2 : 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 4,
                boxShadow: 3,
                border: '2px solid #e0f7fa',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#20b2aa',
                  boxShadow: 6,
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                {/* Step Number Circle */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #20b2aa 0%, #008b8b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    position: 'relative',
                    boxShadow: 3,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      right: -4,
                      bottom: -4,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #20b2aa, #008b8b)',
                      zIndex: -1,
                      opacity: 0.2,
                    }
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.5rem',
                    }}
                  >
                    {step.number}
                  </Typography>
                </Box>

                {/* Step Icon */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: '#e0f7fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    color: '#20b2aa',
                  }}
                >
                  {step.icon}
                </Box>

                {/* Step Title */}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    mb: 2,
                    fontSize: '1.25rem',
                  }}
                >
                  {step.title}
                </Typography>

                {/* Step Description */}
                <Typography
                  sx={{
                    color: '#5a6c7d',
                    lineHeight: 1.7,
                    flex: 1,
                    fontSize: '1rem',
                  }}
                >
                  {step.description}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
        <Button
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
          sx={{
            minWidth: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            ...(canScrollLeft
              ? {
                  bgcolor: '#20b2aa',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#1a9b93',
                    boxShadow: 3,
                  },
                }
              : {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                  cursor: 'not-allowed',
                }),
          }}
        >
          <ArrowLeft size={20} />
        </Button>
        <Button
          onClick={handleScrollRight}
          disabled={!canScrollRight}
          sx={{
            minWidth: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            ...(canScrollRight
              ? {
                  bgcolor: '#20b2aa',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#1a9b93',
                    boxShadow: 3,
                  },
                }
              : {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                  cursor: 'not-allowed',
                }),
          }}
        >
          <ArrowRight size={20} />
        </Button>
      </Box>

      {/* Progress Indicators */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
        {steps.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: index === currentIndex ? '#20b2aa' : '#e0e0e0',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: index === currentIndex ? '#1a9b93' : '#c0c0c0',
              },
            }}
            onClick={() => {
              if (carouselRef.current) {
                const cardWidth = isMobile ? 280 : 320;
                const gap = 24;
                const scrollPosition = index * (cardWidth + gap);
                carouselRef.current.scrollTo({
                  left: scrollPosition,
                  behavior: 'smooth',
                });
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HowItWorksCarousel;
