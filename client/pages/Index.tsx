import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    if (!user) {
      navigate("/signup");
      return;
    }
    
    navigate(`/generate?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Hero Section */}
      <div className="bg-[#FFFD63] relative min-h-[660px] flex justify-center items-start px-20 pt-[184px] pb-[120px]">
        <div className="w-full max-w-[1280px] flex flex-col justify-center items-center gap-6 relative">
          {/* Main Heading */}
          <h1 className="text-[71px] font-black leading-[80px] text-center text-[#0A0B1E] px-[117px]">
            Get instant book summaries. 
            Discover better insights.
          </h1>
          
          {/* Subheading */}
          <p className="text-lg font-light leading-7 text-center text-[#0A0B1E] max-w-[690px] px-6">
            Enter any topic and get comparative insights from the top 5 books, 
            complete with key quotes, Amazon links, and actionable takeaways—all powered by AI.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex items-start gap-4">
            {/* Google Sign Up Button */}
            <Link 
              to="/signup"
              className="flex max-w-[429px] px-[26px] py-5 justify-center items-start gap-2 rounded-2xl bg-[#0A0B1E] shadow-[0px_1px_3px_0px_rgba(10,11,31,0.08),0px_-1px_0px_0px_rgba(0,0,0,0.1)_inset] cursor-pointer"
            >
              <svg className="w-6 h-6" viewBox="0 0 25 24" fill="none">
                <path d="M22.8445 12.2527C22.8445 11.5049 22.7839 10.7532 22.6546 10.0176H12.2793V14.2533H18.2207C17.9742 15.6195 17.182 16.828 16.022 17.5959V20.3443H19.5667C21.6482 18.4285 22.8445 15.5993 22.8445 12.2527Z" fill="#4285F4"/>
                <path d="M12.2808 22.9998C15.2474 22.9998 17.7493 22.0257 19.5722 20.3444L16.0275 17.5959C15.0413 18.2669 13.7681 18.6469 12.2848 18.6469C9.41513 18.6469 6.98201 16.7108 6.10895 14.1079H2.45117V16.9412C4.31847 20.6556 8.12177 22.9998 12.2808 22.9998Z" fill="#34A853"/>
                <path d="M6.10318 14.1083C5.6424 12.7422 5.6424 11.2629 6.10318 9.89674V7.06348H2.44939C0.889265 10.1716 0.889265 13.8335 2.44939 16.9416L6.10318 14.1083Z" fill="#FBBC04"/>
                <path d="M12.2808 5.35374C13.849 5.32949 15.3647 5.91959 16.5004 7.00276L19.6409 3.86232C17.6523 1.99502 15.013 0.968407 12.2808 1.00074C8.12177 1.00074 4.31847 3.34497 2.45117 7.06342L6.10493 9.89668C6.97391 7.28974 9.41111 5.35374 12.2808 5.35374Z" fill="#EA4335"/>
              </svg>
              <span className="text-white font-normal text-base leading-5">
                Sign up with Google
              </span>
            </Link>
            
            {/* Free Sign Up Button */}
            <Link
              to="/signup"
              className="text-black font-normal text-base leading-5 flex max-w-[429px] px-7 py-[21px] items-center rounded-2xl bg-white shadow-[0px_1px_3px_0px_rgba(10,11,31,0.08),0px_-1px_0px_0px_rgba(0,0,0,0.1)_inset] cursor-pointer"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>

      {/* Video/Demo Section */}
      <div className="bg-[#FFFD63] relative h-[717px] flex justify-center items-start px-20">
        <div className="absolute bottom-0 w-full h-[537px] bg-white"></div>
        <div className="w-full max-w-[1272px] relative z-10 bg-[#FFFD6A] rounded-3xl shadow-[0px_4px_8px_0px_rgba(10,11,30,0.06),0px_48px_0px_0px_rgba(10,11,30,0.08)] h-[717px] flex justify-center items-center">
          <img 
            src="https://cdn.builder.io/api/v1/image/assets%2Fce6d23c5183744ad9e38b6730a7e5a8d%2F7ce5ae4255c54d58afbdbebcd7099427?format=webp&width=800" 
            alt="SummifyAI Demo" 
            className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-[0.98]"
          />
          <div className="relative z-20 flex px-12 py-9 items-center gap-5 rounded-[50px] bg-white cursor-pointer">
            <svg className="w-[54px] h-[54px]" viewBox="0 0 54 54" fill="none">
              <path d="M20.25 15.1875L35.4375 27L20.25 38.8125V15.1875Z" fill="#0A0B1E"/>
            </svg>
            <div className="text-[#0A0B1E] font-bold text-[31px] leading-10">
              Take a 2 min. tour
            </div>
          </div>
        </div>
      </div>

      {/* Logo Carousel */}
      <div className="bg-white overflow-hidden py-16">
        <div className="flex items-center gap-12 animate-scroll">
          {/* Mock logos for book publishers/companies */}
          <div className="flex items-center gap-12 whitespace-nowrap">
            <div className="text-2xl font-bold text-gray-400 min-w-[150px]">AMAZON</div>
            <div className="text-2xl font-bold text-gray-400 min-w-[150px]">GOODREADS</div>
            <div className="text-2xl font-bold text-gray-400 min-w-[150px]">PENGUIN</div>
            <div className="text-2xl font-bold text-gray-400 min-w-[150px]">HARPER</div>
            <div className="text-2xl font-bold text-gray-400 min-w-[150px]">SIMON & SCHUSTER</div>
            <div className="text-2xl font-bold text-gray-400 min-w-[150px]">MACMILLAN</div>
          </div>
        </div>
      </div>

      {/* Large Quote Section */}
      <div className="bg-white py-[120px] px-20 flex justify-center items-start">
        <div className="w-full max-w-[1280px] relative">
          <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 w-[405px] h-[83px] bg-[#FFFD63] z-10"></div>
          <div className="text-[#0A0B1E] font-normal text-[53px] leading-[69px] text-center relative z-20">
            All your favorite books in one place. Stop reading everything separately. 
            Start comparing insights effectively. SummifyAI brings structure, wisdom, 
            and clarity to your book discovery and learning journey.
          </div>
        </div>
      </div>

      {/* Process Sections */}
      <div className="w-full max-w-[1440px] mx-auto">
        {/* Search Section */}
        <div className="w-full max-w-[1280px] mx-auto pb-[75px] relative">
          {/* Heading */}
          <div className="absolute left-[60px] -top-[43px] transform -rotate-12 flex items-start gap-0">
            <h2 className="text-[179px] font-black leading-[200px] text-[#0A0B1E] pr-1">Search</h2>
            <span className="text-[200px] font-black leading-[200px] text-[#0A0B1E]">.</span>
          </div>
          
          {/* Content */}
          <div className="pt-[240px] -mt-9">
            <div className="bg-[#C7D0FF] rounded-[80px] min-h-[780px] flex items-center relative">
              {/* Top curve */}
              <svg className="absolute -top-[134px] w-full" viewBox="0 0 1280 108" fill="none">
                <path d="M1280 48.6785C1280 48.6785 1280.56 48.6785 1225.5 48.6785C1170.43 48.6785 868.164 59.1875 637.892 59.1875C407.62 59.1875 100.309 48.6785 50.2857 48.6785C0.273255 48.6785 4.62532e-05 48.6785 4.62532e-05 48.6785" stroke="white" strokeWidth="95.6322"/>
              </svg>
              
              {/* Bottom curve */}
              <svg className="absolute -bottom-[134px] w-full" viewBox="0 0 1280 108" fill="none">
                <path d="M0.000228097 58.989C0.000228097 58.989 -0.564498 58.989 54.5049 58.989C109.575 58.989 411.836 48.48 642.108 48.48C872.38 48.48 1179.69 58.989 1229.71 58.989C1279.73 58.989 1280 58.989 1280 58.989" stroke="white" strokeWidth="95.6322"/>
              </svg>
              
              <div className="flex px-20 py-[150px] justify-between items-center w-full">
                {/* Animation Block */}
                <div className="flex max-w-[520px] px-[18px] flex-col justify-center items-start flex-1">
                  <div className="w-[484px] max-w-[520px] flex-1 bg-gray-200 rounded-lg flex items-center justify-center h-[400px]">
                    <div className="text-center text-gray-600">
                      <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                      <p>AI searching through thousands of books</p>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="w-[520px] max-w-[520px]">
                  <h3 className="text-[39px] font-bold leading-[48px] text-[#0A0B1E] mb-5">
                    Find books that practically teach themselves
                  </h3>
                  <p className="text-[19px] font-light leading-[31px] text-[#0A0B1E] mb-[30px]">
                    Smart discovery leads to better insights. Enter any topic and our AI searches 
                    through thousands of books to find the most relevant ones with high-quality content.
                  </p>
                  <button className="inline-flex px-8 py-[18px] justify-center items-center rounded-2xl border-2 border-[#0A0B1E] bg-[#C7D0FF] text-[#0A0B1E] font-normal text-sm leading-[19px] cursor-pointer">
                    Learn more
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analyze Section */}
        <div className="w-full max-w-[1280px] mx-auto -mt-9">
          {/* Heading */}
          <div className="absolute right-[80px] -top-[38px] transform rotate-12 flex items-start">
            <h2 className="text-[173px] font-black leading-[200px] text-[#0A0B1E]">Analyze</h2>
            <span className="text-[200px] font-black leading-[200px] text-[#0A0B1E]">.</span>
          </div>
          
          <div className="pt-[106px] flex flex-col items-start gap-[-9px]">
            {/* Top curve */}
            <svg className="w-full" viewBox="0 0 1280 108" fill="none">
              <path d="M1280 49.1467C1280 49.1467 1280.56 49.1467 1225.5 49.1467C1170.43 49.1467 868.164 59.6558 637.892 59.6558C407.62 59.6558 100.309 49.1467 50.2857 49.1467C0.273255 49.1467 4.62532e-05 49.1467 4.62532e-05 49.1467" stroke="white" strokeWidth="95.6322"/>
            </svg>
            
            <div className="bg-[#BFF9EA] rounded-t-[80px] w-full flex flex-col items-center">
              <div className="flex w-full px-20 py-[150px] justify-between items-center">
                {/* Description */}
                <div className="w-[520px] max-w-[520px]">
                  <h3 className="text-[40px] font-bold leading-[48px] text-[#0A0B1E] mb-5">
                    Compare different perspectives
                  </h3>
                  <p className="text-[19px] font-light leading-[31px] text-[#0A0B1E] mb-[30px]">
                    Say goodbye to surface-level summaries. Get deep insights. AI analyzes 
                    multiple viewpoints, extracts key themes, contrasting opinions, and 
                    synthesizes them into coherent comparisons.
                  </p>
                  <button className="inline-flex px-8 py-[18px] justify-center items-center rounded-2xl border-2 border-[#0A0B1E] bg-[#BFF9EA] text-[#0A0B1E] font-normal text-sm leading-[19px] cursor-pointer">
                    Show me the insights
                  </button>
                </div>
                
                {/* Animation Block */}
                <div className="h-[451px] max-w-[520px] flex-1 relative">
                  <div className="w-[484px] h-[452px] bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <p>AI analyzing book content and themes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Section */}
        <div className="w-full max-w-[1280px] mx-auto pb-[75px] relative">
          {/* Heading */}
          <div className="absolute left-[62px] -top-[59px] transform -rotate-12 flex items-start">
            <h2 className="text-[174px] font-black leading-[200px] text-[#0A0B1E]">Generate</h2>
            <span className="text-[200px] font-black leading-[200px] text-[#0A0B1E]">.</span>
          </div>
          
          <div className="pt-[240px] -mt-9">
            <div className="bg-[#FFD8AA] rounded-[80px] min-h-[690px] flex items-center relative">
              {/* Top curve */}
              <svg className="absolute -top-[134px] w-full" viewBox="0 0 1280 109" fill="none">
                <path d="M1279.99 49.1709C1279.99 49.1709 1280.55 49.1709 1225.48 49.1709C1170.42 49.1709 868.16 59.6797 637.893 59.6797C407.626 59.6797 100.32 49.1709 50.2983 49.1709C0.286795 49.1709 0.0135918 49.1709 0.0135918 49.1709" stroke="white" strokeWidth="95.6303"/>
              </svg>
              
              {/* Bottom curve */}
              <svg className="absolute -bottom-[134px] w-full" viewBox="0 0 1280 108" fill="none">
                <path d="M0.000228097 59.4895C0.000228097 59.4895 -0.564498 59.4895 54.5049 59.4895C109.575 59.4895 411.836 48.9805 642.108 48.9805C872.38 48.9805 1179.69 59.4895 1229.71 59.4895C1279.73 59.4895 1280 59.4895 1280 59.4895" stroke="white" strokeWidth="95.6322"/>
              </svg>
              
              <div className="flex px-20 py-[150px] justify-between items-center w-full">
                {/* Description */}
                <div className="w-[520px] max-w-[520px]">
                  <h3 className="text-[40px] font-bold leading-[48px] text-[#0A0B1E] mb-5">
                    Get your perfect summary
                  </h3>
                  <p className="text-[20px] font-light leading-[31px] text-[#0A0B1E] mb-[30px]">
                    Summarize your learning and capture insights in seconds. Access your 
                    300-word comparative analysis, key quotes, Amazon purchase links, 
                    and actionable takeaways—all from one beautiful interface.
                  </p>
                  <button className="inline-flex px-8 py-[18px] justify-center items-center rounded-2xl border-2 border-[#0A0B1E] bg-[#FFD8AA] text-[#0A0B1E] font-normal text-sm leading-[19px] cursor-pointer">
                    Take a look
                  </button>
                </div>
                
                {/* Animation Block */}
                <div className="flex max-w-[520px] px-16 flex-col justify-center items-start flex-1">
                  <div className="w-[390px] h-[390px] bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                      </svg>
                      <p>Beautiful summary with quotes and links</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="w-full max-w-[1280px] mx-auto pb-[75px] relative">
          {/* Heading */}
          <div className="absolute left-[92px] -top-[111px] transform rotate-12 flex items-start w-[1095px] pb-[0.005px]">
            <h2 className="text-[178px] font-black leading-[200px] text-[#0A0B1E] pr-2">Share</h2>
            <span className="text-[200px] font-black leading-[180px] text-[#0A0B1E] py-10">.</span>
          </div>
          
          <div className="pt-[240px] -mt-9">
            <div className="bg-[#FFD5D5] rounded-[80px] min-h-[699px] flex flex-col items-center relative">
              {/* Top curve */}
              <svg className="absolute -top-[134px] w-full" viewBox="0 0 1280 109" fill="none">
                <path d="M1280 49.1677C1280 49.1677 1280.56 49.1677 1225.5 49.1677C1170.43 49.1677 868.164 59.6768 637.892 59.6768C407.62 59.6768 100.309 49.1677 50.2857 49.1677C0.273255 49.1677 4.62532e-05 49.1677 4.62532e-05 49.1677" stroke="white" strokeWidth="95.6322"/>
              </svg>
              
              {/* Bottom curve */}
              <svg className="absolute -bottom-[134px] w-full" viewBox="0 0 1280 87" fill="none">
                <path d="M0.000228097 59.1497C0.000228097 59.1497 -0.564498 59.1497 54.5049 59.1497C109.575 59.1497 411.836 48.6406 642.108 48.6406C872.38 48.6406 1179.69 59.1497 1229.71 59.1497C1279.73 59.1497 1280 59.1497 1280 59.1497" stroke="white" strokeWidth="95.6322"/>
              </svg>
              
              <div className="flex w-full px-20 py-[150px] justify-between items-center">
                {/* Animation Block */}
                <div className="flex max-w-[520px] pl-[130px] flex-col justify-center items-end flex-1">
                  <div className="w-[390px] h-[390px] bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                      </svg>
                      <p>Social sharing and referral system</p>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="w-[520px] max-w-[520px]">
                  <h3 className="text-[40px] font-bold leading-[48px] text-[#0A0B1E] mb-5 pr-[90px]">
                    One link for all your reading insights
                  </h3>
                  <p className="text-[20px] font-light leading-[31px] text-[#0A0B1E] mb-[30px] pr-8">
                    Your SummifyAI workspace gives you one place to save summaries, 
                    share insights, and track your reading journey. Build your personal 
                    library and help friends discover great books.
                  </p>
                  <button className="inline-flex px-8 py-[18px] justify-center items-center rounded-2xl border-2 border-[#0A0B1E] bg-[#FFD5D5] text-[#0A0B1E] font-normal text-sm leading-[19px] cursor-pointer">
                    Create library
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Section */}
      <div className="bg-white px-20 py-20">
        <div className="w-full max-w-[1280px] mx-auto">
          <h2 className="text-[57px] font-bold leading-[69px] text-[#0A0B1E] pr-[370px] mb-20">
            Loved by readers everywhere
          </h2>
          
          {/* Testimonials Grid */}
          <div className="grid grid-cols-4 gap-[18px] h-[834px]">
            {/* Testimonial cards would go here */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 h-fit">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Sarah K.</div>
                  <div className="text-gray-600 text-xs">Product Manager</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-6">
                "SummifyAI has completely changed how I discover and consume book insights. 
                The comparative summaries save me hours of research."
              </p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 h-fit mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Mike R.</div>
                  <div className="text-gray-600 text-xs">Entrepreneur</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-6">
                "The affiliate earning feature is genius. I share summaries with my team 
                and actually earn money from the books they purchase. Win-win!"
              </p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 h-fit mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Lisa Chen</div>
                  <div className="text-gray-600 text-xs">VP of Learning</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-6">
                "Finally, a tool that doesn't just summarize books but actually helps me 
                understand different perspectives on the same topic. Brilliant!"
              </p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 h-fit">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">David Park</div>
                  <div className="text-gray-600 text-xs">@bookworm_dave</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-6">
                "SummifyAI > every other book summary tool"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#0A0B1E] text-white py-20 px-20">
        <div className="w-full max-w-[1280px] mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to run better research? Unlock better insights?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of readers who use SummifyAI to discover, compare, and share book insights.
          </p>
          <Link
            to="/signup"
            className="inline-flex px-8 py-4 bg-[#FFFD63] text-[#0A0B1E] rounded-2xl font-semibold text-lg hover:bg-yellow-300 transition-colors"
          >
            Get started for free
          </Link>
        </div>
      </div>
    </div>
  );
}