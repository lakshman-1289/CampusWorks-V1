import React from "react";
import { Carousel, TestimonialCard } from "./retro-testimonial";

const TestimonialDemo = () => {
  const testimonialData = [
    {
      id: "1",
      description: "CampusWorks has been a game-changer for my academic journey. I've been able to get help with complex assignments while also earning money by helping other students.",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      name: "Sarah Chen",
      designation: "Computer Science Student",
    },
    {
      id: "2", 
      description: "The platform is incredibly user-friendly and the quality of work is outstanding. I've completed over 50 tasks and earned more than ₹25,000!",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      name: "Michael Rodriguez",
      designation: "Engineering Student",
    },
    {
      id: "3",
      description: "What I love most about CampusWorks is the community aspect. You're not just getting help, you're connecting with fellow students who understand your struggles.",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      name: "David Kim",
      designation: "Mathematics Major",
    },
    {
      id: "4",
      description: "The secure payment system gives me peace of mind. I know my money is safe and I get paid promptly when I complete tasks.",
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      name: "Emily Thompson",
      designation: "Business Student",
    },
    {
      id: "5",
      description: "As a working student, CampusWorks has been a lifesaver. I can earn money during my free time while helping others with their academic challenges.",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      name: "James Wilson",
      designation: "Part-time Student",
    },
    {
      id: "6",
      description: "The variety of subjects available is impressive. From programming to writing, there's always something I can help with or get help for.",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      name: "Sophia Martinez",
      designation: "Liberal Arts Student",
    },
  ];

  const cards = testimonialData.map((testimonial, index) => (
    <TestimonialCard
      key={testimonial.id}
      testimonial={testimonial}
      index={index}
      backgroundImage="https://images.unsplash.com/photo-1528458965990-428de4b1cb0d?q=80&w=3129&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    />
  ));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Students Say</h2>
          <p className="text-lg text-gray-600">Hear from students who have used CampusWorks</p>
        </div>
        <Carousel items={cards} />
      </div>
    </div>
  );
};

export default TestimonialDemo;
