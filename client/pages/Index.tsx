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
    <div className="min-h-screen bg-white font-['Inter'] antialiased">
      {/* Hero Section - Exact match to Figma */}
      <div className="bg-[#FFFD63] relative min-h-[660px] flex justify-center items-start px-20 pt-[184px] pb-[120px]">
        <div className="w-full max-w-[1280px] flex flex-col justify-center items-center gap-[23px] relative">
          {/* Main Heading */}
          <h1 className="text-[71px] font-black leading-[80px] text-center text-[#0A0B1E] flex w-full max-w-[1280px] px-[117px] justify-center items-start">
            Get instant book summaries. Discover better insights.
          </h1>

          {/* Subheading */}
          <p className="text-[18px] font-light leading-[28px] text-center text-[#0A0B1E] flex max-w-[690px] px-6 justify-center items-start">
            Enter any topic and get comparative insights from the top 5 books,
            complete with key quotes, Amazon affiliate links, and actionable
            takeaways—all powered by AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-start gap-4">
            {/* Google Sign Up Button */}
            <Link
              to="/signup"
              className="flex max-w-[429px] px-[26px] py-5 justify-center items-start gap-2 rounded-2xl bg-[#0A0B1E] shadow-[0px_1px_3px_0px_rgba(10,11,31,0.08),-1px_0px_0px_0px_rgba(0,0,0,0.10)_inset] cursor-pointer"
            >
              <svg className="w-6 h-6" viewBox="0 0 25 24" fill="none">
                <path
                  d="M22.8445 12.2527C22.8445 11.5049 22.7839 10.7532 22.6546 10.0176H12.2793V14.2533H18.2207C17.9742 15.6195 17.182 16.828 16.022 17.5959V20.3443H19.5667C21.6482 18.4285 22.8445 15.5993 22.8445 12.2527Z"
                  fill="#4285F4"
                />
                <path
                  d="M12.2808 22.9998C15.2474 22.9998 17.7493 22.0257 19.5722 20.3444L16.0275 17.5959C15.0413 18.2669 13.7681 18.6469 12.2848 18.6469C9.41513 18.6469 6.98201 16.7108 6.10895 14.1079H2.45117V16.9412C4.31847 20.6556 8.12177 22.9998 12.2808 22.9998Z"
                  fill="#34A853"
                />
                <path
                  d="M6.10318 14.1083C5.6424 12.7422 5.6424 11.2629 6.10318 9.89674V7.06348H2.44939C0.889265 10.1716 0.889265 13.8335 2.44939 16.9416L6.10318 14.1083Z"
                  fill="#FBBC04"
                />
                <path
                  d="M12.2808 5.35374C13.849 5.32949 15.3647 5.91959 16.5004 7.00276L19.6409 3.86232C17.6523 1.99502 15.013 0.968407 12.2808 1.00074C8.12177 1.00074 4.31847 3.34497 2.45117 7.06342L6.10493 9.89668C6.97391 7.28974 9.41111 5.35374 12.2808 5.35374Z"
                  fill="#EA4335"
                />
              </svg>
              <div className="text-white font-normal text-base leading-5 flex px-[6.75px] items-start">
                Sign up with Google
              </div>
            </Link>

            {/* Free Sign Up Button */}
            <Link
              to="/signup"
              className="text-black font-normal text-base leading-5 flex max-w-[429px] px-7 py-[21px] items-center rounded-2xl bg-white shadow-[0px_1px_3px_0px_rgba(10,11,31,0.08),-1px_0px_0px_0px_rgba(0,0,0,0.10)_inset] cursor-pointer"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>

      {/* Video/Demo Section */}
      <div className="bg-[#FFFD63] flex w-full px-20 justify-center items-start relative h-[717px]">
        <div className="absolute bottom-0 w-full h-[537.59px] bg-white"></div>
        <div className="flex w-full max-w-[1272px] px-[420px] py-[295px] justify-center items-start rounded-3xl bg-[#FFFD6A] shadow-[0px_4px_8px_0px_rgba(10,11,30,0.06),0px_48px_0px_0px_rgba(10,11,30,0.08)] relative z-10">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fce6d23c5183744ad9e38b6730a7e5a8d%2F7ce5ae4255c54d58afbdbebcd7099427?format=webp&width=800"
            alt="SummifyAI Demo"
            className="absolute inset-0 w-full h-[717px] opacity-[0.98] rounded-3xl object-cover"
          />
          <div className="flex px-12 py-9 items-center gap-5 rounded-[50px] bg-white relative z-20 cursor-pointer">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/2af035ca0d690ea0b80f16992497f9d6c916b1ad?width=108"
              alt="Play button"
              className="w-[54px] h-[54px]"
            />
            <div className="text-[#0A0B1E] font-bold text-[31px] leading-10">
              Take a 2 min. tour
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling Logo Section */}
      <div className="bg-white flex w-full px-0 py-16 justify-center items-start overflow-hidden">
        <div className="flex px-[876px] items-center gap-12 animate-[scroll_30s_linear_infinite]">
          <div className="min-w-[200px] h-[112px] flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">AMAZON</span>
          </div>
          <div className="min-w-[200px] h-[112px] flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">GOODREADS</span>
          </div>
          <div className="min-w-[200px] h-[112px] flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">PENGUIN</span>
          </div>
          <div className="min-w-[200px] h-[112px] flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">HARPER</span>
          </div>
          <div className="min-w-[200px] h-[112px] flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">MACMILLAN</span>
          </div>
        </div>
      </div>

      {/* Large Quote Section */}
      <div className="bg-white flex w-full px-0 py-[120px] justify-center items-start">
        <div className="w-full max-w-[1280px] relative">
          <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 w-[405px] h-[83px] bg-[#FFFD63] z-10"></div>
          <div className="text-[#0A0B1E] font-normal text-[53px] leading-[69.12px] text-center relative z-20">
            All your team's facilitation tools in one place. Stop hosting
            snoozefests. Start collaborating effectively. SummifyAI brings
            structure, energy, and joy to your book discovery, summary creation,
            and learning sessions.
          </div>
        </div>
      </div>

      {/* Process Sections Container */}
      <div className="flex w-full justify-center items-start bg-white">
        <div className="w-full max-w-[1440px]">
          {/* Plan Section */}
          <div className="flex w-full max-w-[1280px] mx-auto pb-[75px] justify-center items-start relative">
            <div className="w-full relative">
              <div className="w-full pt-[240px] relative">
                <div className="flex w-full items-center rounded-[80px] bg-[#C7D0FF] relative -mt-9 min-h-[780px]">
                  {/* Top Curve */}
                  <svg
                    className="absolute -top-[134px] flex w-full px-0 py-[48px] items-start"
                    viewBox="0 0 1280 108"
                    fill="none"
                  >
                    <path
                      d="M1280 48.6785C1280 48.6785 1280.56 48.6785 1225.5 48.6785C1170.43 48.6785 868.164 59.1875 637.892 59.1875C407.62 59.1875 100.309 48.6785 50.2857 48.6785C0.273255 48.6785 4.62532e-05 48.6785 4.62532e-05 48.6785"
                      stroke="white"
                      strokeWidth="95.6322"
                    />
                  </svg>

                  {/* Bottom Curve */}
                  <svg
                    className="absolute -bottom-[134px] flex w-full px-0 py-[48px] items-start"
                    viewBox="0 0 1280 108"
                    fill="none"
                  >
                    <path
                      d="M0.000228097 58.989C0.000228097 58.989 -0.564498 58.989 54.5049 58.989C109.575 58.989 411.836 48.48 642.108 48.48C872.38 48.48 1179.69 58.989 1229.71 58.989C1279.73 58.989 1280 58.989 1280 58.989"
                      stroke="white"
                      strokeWidth="95.6322"
                    />
                  </svg>

                  <div className="flex px-20 py-[150px] justify-between items-center w-full">
                    {/* Animation Block */}
                    <div className="flex max-w-[520px] px-[18px] flex-col justify-center items-start flex-1">
                      <div className="w-[484px] max-w-[520px] flex-1 relative">
                        <div className="w-full h-[400px] bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-yellow-300">
                          <div className="text-center text-yellow-600 p-8">
                            <svg
                              className="w-16 h-16 mx-auto mb-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="font-medium text-lg">
                              AI Topic Search
                            </div>
                            <div className="text-sm mt-2">
                              Searching through millions of books
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="w-[520px] max-w-[520px]">
                      <div className="flex w-[520px] pr-[13px] items-start mb-5">
                        <h3 className="text-[39px] font-bold leading-[48.4px] text-[#0A0B1E] flex px-0 py-[1px] items-start">
                          Prepare sessions that practically run themselves
                        </h3>
                      </div>
                      <p className="text-[19px] font-light leading-[30.8px] text-[#0A0B1E] flex w-[520px] px-0 py-0 pr-[22px] items-start mb-[30px]">
                        Structured discovery leads to better outcomes. Set up
                        the perfect research flow with AI-powered book
                        selection, pre-loaded insights, and a reusable summary
                        library.
                      </p>
                      <button className="text-[#0A0B1E] font-normal text-sm leading-[19.2px] inline-flex max-w-[134px] px-8 py-[18px] justify-center items-center rounded-2xl border-2 border-[#0A0B1E] bg-[#C7D0FF] cursor-pointer">
                        Learn more
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plan Heading */}
                <div className="absolute left-[60px] -top-[43px] flex w-[442px] transform -rotate-12 items-start gap-0">
                  <h2 className="text-[179px] font-black leading-[200px] text-[#0A0B1E] flex px-0 py-10 items-start">
                    Plan
                  </h2>
                  <h2 className="text-[200px] font-black leading-[200px] text-[#0A0B1E] flex px-0 py-10 items-start">
                    .
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Run Section */}
          <div className="inline-flex flex-col items-start gap-[-35px] w-full max-w-[1280px] mx-auto">
            <div className="w-full relative">
              <div className="flex w-full flex-col items-start gap-[-9px] pt-[106px]">
                {/* Top Curve */}
                <svg
                  className="flex w-full px-0 py-[48px] items-start"
                  viewBox="0 0 1280 108"
                  fill="none"
                >
                  <path
                    d="M1280 49.1467C1280 49.1467 1280.56 49.1467 1225.5 49.1467C1170.43 49.1467 868.164 59.6558 637.892 59.6558C407.62 59.6558 100.309 49.1467 50.2857 49.1467C0.273255 49.1467 4.62532e-05 49.1467 4.62532e-05 49.1467"
                    stroke="white"
                    strokeWidth="95.6322"
                  />
                </svg>

                <div className="flex w-full flex-col items-center rounded-t-[80px] bg-[#BFF9EA]">
                  <div className="flex w-full px-20 py-[150px] justify-between items-center">
                    {/* Description */}
                    <div className="w-[520px] max-w-[520px]">
                      <h3 className="text-[40px] font-bold leading-[48.4px] text-[#0A0B1E] flex w-[399px] px-0 py-0 pr-[6px] items-start mb-5">
                        Bump up the energy
                      </h3>
                      <p className="text-[19px] font-light leading-[30.8px] text-[#0A0B1E] flex w-[520px] px-0 py-0 pr-[66px] items-start mb-[30px]">
                        Say goodbye to research fatigue. Say hello to instant
                        insights. Keep everyone engaged with AI-powered
                        summaries, interactive quotes, affiliate earnings, and
                        shareable content.
                      </p>
                      <button className="text-[#0A0B1E] font-normal text-sm leading-[19.2px] inline-flex max-w-[196px] px-8 py-[18px] justify-center items-center rounded-2xl border-2 border-[#0A0B1E] bg-[#BFF9EA] cursor-pointer">
                        Show me the energy
                      </button>
                    </div>

                    {/* Animation Block */}
                    <div className="h-[451px] max-w-[520px] flex-1 relative">
                      <div className="w-[484px] h-[452px] absolute left-[18px] top-0">
                        <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-green-300">
                          <div className="text-center text-green-600 p-8">
                            <svg
                              className="w-16 h-16 mx-auto mb-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="font-medium text-lg">
                              AI Analysis
                            </div>
                            <div className="text-sm mt-2">
                              Extracting insights and themes
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Run Heading */}
                <div className="absolute right-[80px] -top-[38px] flex w-[389px] transform rotate-12 items-start">
                  <h2 className="text-[173px] font-black leading-[200px] text-[#0A0B1E] flex px-0 py-10 items-start">
                    Run
                  </h2>
                  <h2 className="text-[200px] font-black leading-[200px] text-[#0A0B1E] flex px-0 py-10 items-start">
                    .
                  </h2>
                </div>
              </div>
            </div>

            {/* Tools Section */}
            <div className="flex w-full max-w-[1280px] mx-auto pb-[111px] justify-end items-start">
              <div className="flex flex-col items-start gap-[-11px] flex-1">
                <div className="flex w-full flex-col items-center rounded-b-[80px] bg-[#BFF9EA]">
                  <div className="flex w-full px-20 py-[150px] justify-between items-center">
                    {/* Animation Block */}
                    <div className="flex max-w-[520px] px-[18px] flex-col justify-center items-start flex-1">
                      <div className="w-[484px] max-w-[520px] flex-1 relative">
                        <div className="w-full h-[400px] bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-teal-300">
                          <div className="text-center text-teal-600 p-8">
                            <svg
                              className="w-16 h-16 mx-auto mb-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="font-medium text-lg">
                              Integrations
                            </div>
                            <div className="text-sm mt-2">
                              All your favorite book sources
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="w-[520px] max-w-[520px]">
                      <div className="flex w-[520px] pr-[6px] flex-col items-start gap-[-49px] mb-5">
                        <h3 className="text-[40px] font-bold leading-[48.4px] text-[#0A0B1E]">
                          All your favorite facilitation tools
                        </h3>
                        <div className="w-[513px] relative">
                          <div className="absolute right-0 top-[1px] w-[194px] text-[40px] font-bold leading-[48.4px] text-[#0A0B1E]">
                            , minus all
                          </div>
                          <div className="absolute left-0 top-[49px] w-[157px] text-[39px] font-bold leading-[48.4px] text-[#0A0B1E]">
                            the tabs
                          </div>
                        </div>
                      </div>
                      <p className="text-[20px] font-light leading-[30.8px] text-[#0A0B1E] flex w-[520px] px-0 py-0 pr-2 items-start mb-[30px]">
                        Stop juggling countless apps and sources. Keep everyone
                        focused on one window and one outcome. Access Amazon,
                        Goodreads, Google Books, and more—all inside the
                        SummifyAI interface.
                      </p>
                      <button className="text-[#0A0B1E] font-normal text-sm leading-[19.2px] inline-flex max-w-[186px] px-8 py-[18px] justify-center items-center rounded-2xl border-2 border-[#0A0B1E] bg-[#BFF9EA] cursor-pointer">
                        See all integrations
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Curve */}
                <svg
                  className="flex w-full px-0 py-[48px] items-start"
                  viewBox="0 0 1280 108"
                  fill="none"
                >
                  <path
                    d="M0.000228097 59.6594C0.000228097 59.6594 -0.564498 59.6594 54.5049 59.6594C109.575 59.6594 411.836 49.1504 642.108 49.1504C872.38 49.1504 1179.69 59.6594 1229.71 59.6594C1279.73 59.6594 1280 59.6594 1280 59.6594"
                    stroke="white"
                    strokeWidth="95.6322"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Recap Section */}
          <div className="flex w-full max-w-[1280px] mx-auto pb-[75px] justify-center items-start relative">
            <div className="w-full relative">
              <div className="w-full pt-[240px] relative">
                <div className="flex w-full items-center rounded-[80px] bg-[#FFD8AA] relative -mt-9 min-h-[690px]">
                  {/* Top Curve */}
                  <svg
                    className="absolute -top-[134px] flex w-full px-0 py-[48px] items-start"
                    viewBox="0 0 1280 109"
                    fill="none"
                  >
                    <path
                      d="M1279.99 49.1709C1279.99 49.1709 1280.55 49.1709 1225.48 49.1709C1170.42 49.1709 868.16 59.6797 637.893 59.6797C407.626 59.6797 100.32 49.1709 50.2983 49.1709C0.286795 49.1709 0.0135918 49.1709 0.0135918 49.1709"
                      stroke="white"
                      strokeWidth="95.6303"
                    />
                  </svg>

                  {/* Bottom Curve */}
                  <svg
                    className="absolute -bottom-[134px] flex w-full px-0 py-[48px] items-start"
                    viewBox="0 0 1280 108"
                    fill="none"
                  >
                    <path
                      d="M0.000228097 59.4895C0.000228097 59.4895 -0.564498 59.4895 54.5049 59.4895C109.575 59.4895 411.836 48.9805 642.108 48.9805C872.38 48.9805 1179.69 59.4895 1229.71 59.4895C1279.73 59.4895 1280 59.4895 1280 59.4895"
                      stroke="white"
                      strokeWidth="95.6322"
                    />
                  </svg>

                  <div className="flex px-20 py-[150px] justify-between items-center w-full">
                    {/* Description */}
                    <div className="w-[520px] max-w-[520px]">
                      <h3 className="text-[40px] font-bold leading-[48.4px] text-[#0A0B1E] flex w-[520px] px-0 py-0 pr-[189px] items-start mb-5">
                        Don't forget your takeaways
                      </h3>
                      <p className="text-[20px] font-light leading-[30.8px] text-[#0A0B1E] flex w-[520px] px-0 py-0 pr-[15px] items-start mb-[30px]">
                        Summarize your sessions and capture outcomes in seconds.
                        Access and share your recordings, personal notes, key
                        quotes, and affiliate earnings—all from one dashboard.
                      </p>
                      <button className="text-[#0A0B1E] font-normal text-sm leading-[19.2px] inline-flex max-w-[135px] px-8 py-[18px] justify-center items-center rounded-2xl border-2 border-[#0A0B1E] bg-[#FFD8AA] cursor-pointer">
                        Take a look
                      </button>
                    </div>

                    {/* Animation Block */}
                    <div className="flex max-w-[520px] px-16 flex-col justify-center items-start flex-1">
                      <div className="w-[390px] h-[390px] relative">
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-orange-300">
                          <div className="text-center text-orange-600 p-8">
                            <svg
                              className="w-16 h-16 mx-auto mb-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="font-medium text-lg">
                              Export & Share
                            </div>
                            <div className="text-sm mt-2">
                              PDFs, links, and summaries
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recap Heading */}
                <div className="absolute left-[62px] -top-[59px] flex w-[591px] transform -rotate-12 items-start">
                  <h2 className="text-[174px] font-black leading-[200px] text-[#0A0B1E] flex px-0 py-10 items-start">
                    Recap
                  </h2>
                  <h2 className="text-[200px] font-black leading-[200px] text-[#0A0B1E] flex px-0 py-10 items-start">
                    .
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Collaborate Section */}
          <div className="flex w-full max-w-[1280px] mx-auto pb-[75px] justify-center items-start relative">
            <div className="w-full relative">
              <div className="w-full pt-[240px] relative">
                <div className="flex w-full flex-col items-center rounded-[80px] bg-[#FFD5D5] relative -mt-9 min-h-[699px]">
                  {/* Top Curve */}
                  <svg
                    className="absolute -top-[134px] flex w-full px-0 py-[48px] items-start"
                    viewBox="0 0 1280 109"
                    fill="none"
                  >
                    <path
                      d="M1280 49.1677C1280 49.1677 1280.56 49.1677 1225.5 49.1677C1170.43 49.1677 868.164 59.6768 637.892 59.6768C407.62 59.6768 100.309 49.1677 50.2857 49.1677C0.273255 49.1677 4.62532e-05 49.1677 4.62532e-05 49.1677"
                      stroke="white"
                      strokeWidth="95.6322"
                    />
                  </svg>

                  {/* Bottom Curve */}
                  <svg
                    className="absolute -bottom-[134px] flex w-full px-0 py-[48px] items-start"
                    viewBox="0 0 1280 87"
                    fill="none"
                  >
                    <path
                      d="M0.000228097 59.1497C0.000228097 59.1497 -0.564498 59.1497 54.5049 59.1497C109.575 59.1497 411.836 48.6406 642.108 48.6406C872.38 48.6406 1179.69 59.1497 1229.71 59.1497C1279.73 59.1497 1280 59.1497 1280 59.1497"
                      stroke="white"
                      strokeWidth="95.6322"
                    />
                  </svg>

                  <div className="flex w-full px-20 py-[150px] justify-between items-center">
                    {/* Animation Block */}
                    <div className="flex max-w-[520px] pl-[130px] flex-col justify-center items-end flex-1">
                      <div className="w-[390px] h-[390px] relative">
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-pink-300">
                          <div className="text-center text-pink-600 p-8">
                            <svg
                              className="w-16 h-16 mx-auto mb-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                            </svg>
                            <div className="font-medium text-lg">
                              Team Workspace
                            </div>
                            <div className="text-sm mt-2">
                              Collaborate and share insights
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="w-[520px] max-w-[520px]">
                      <div className="flex w-[520px] pr-[90px] items-start mb-5">
                        <h3 className="text-[40px] font-bold leading-[48.4px] text-[#0A0B1E] flex px-0 py-[1px] items-start">
                          One workspace for all your team's sessions
                        </h3>
                      </div>
                      <p className="text-[20px] font-light leading-[30.8px] text-[#0A0B1E] flex w-[520px] px-0 py-0 pr-8 items-start mb-[30px]">
                        Your SummifyAI workspace gives your team one place to
                        create summaries, share insights, and access research.
                        Save on setup time, create team-wide consistency, and
                        keep tabs on your team's reading progress.
                      </p>
                      <button className="text-[#0A0B1E] font-normal text-sm leading-[19.2px] inline-flex max-w-[179px] px-8 py-[18px] justify-center items-center rounded-2xl border-2 border-[#0A0B1E] bg-[#FFD5D5] cursor-pointer">
                        Create workspace
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collaborate Heading */}
                <div className="absolute left-[92px] -top-[111px] flex w-[1095px] transform rotate-12 pb-[0.005px] items-start">
                  <h2 className="text-[178px] font-black leading-[200px] text-[#0A0B1E] flex px-0 py-10 items-start">
                    Collaborate
                  </h2>
                  <h2 className="text-[200px] font-black leading-[180px] text-[#0A0B1E] flex px-0 py-5 items-start">
                    .
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white flex w-full justify-center items-start px-0 py-20">
        <div className="w-full max-w-[1440px] px-20">
          <h2 className="text-[57px] font-bold leading-[69.12px] text-[#0A0B1E] flex w-full max-w-[1280px] px-0 py-0 pr-[370px] items-start mb-20">
            Loved by facilitators everywhere
          </h2>

          {/* Testimonials Grid */}
          <div className="inline-flex h-[834px] pl-[2px] justify-end items-center w-full max-w-[1280px]">
            <div className="w-full h-[834px] grid grid-cols-4 gap-[18px] grid-rows-[min-content]">
              {/* Testimonial 1 */}
              <div className="flex w-[306px] items-start rounded-2xl bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.07)] h-[411px] col-span-1 row-span-1">
                <div className="flex w-full p-[17px] items-start rounded-2xl border border-[#E6E6E6] bg-transparent shadow-[0px_1px_2px_0px_rgba(0,0,0,0.07)]">
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex pr-4 items-center gap-3 w-full mb-2">
                      <div className="flex flex-col items-start flex-1">
                        <div className="text-[#0A0B1E] font-medium text-base leading-6">
                          Rob H.
                        </div>
                        <div className="text-[#171945] font-normal text-sm leading-5">
                          Founder
                        </div>
                      </div>
                      <div className="flex items-start w-[42px] h-[42px]">
                        <div className="flex w-[42px] items-start rounded-full bg-black/5">
                          <div className="w-[42px] h-[42px] rounded-full bg-gray-300"></div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[#0A0B1E] font-medium text-sm leading-6 tracking-[-0.4px] flex w-full pr-[82px] items-start mb-2">
                      SummifyAI's LEGENDARY Product
                    </h3>
                    <div className="flex w-full flex-col items-start gap-2 opacity-90">
                      <div className="flex flex-col justify-end items-start gap-[23px]">
                        <p className="flex flex-col justify-center text-[#0A0B1E] font-normal text-base leading-6 tracking-[-0.4px]">
                          SummifyAI will forever change how you approach book
                          research and discovery - from the reader to the
                          learner; this unique tool will add efficiency, insight
                          and discipline for more engaging learning sessions.
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs">Feb 16, 2024</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="flex w-[306px] items-start rounded-2xl bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.07)] h-[399px] col-span-1 row-span-1">
                <div className="flex w-full p-[17px] items-start rounded-2xl border border-[#E6E6E6] bg-transparent shadow-[0px_1px_2px_0px_rgba(0,0,0,0.07)]">
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex pr-4 items-center gap-3 w-full mb-2">
                      <div className="flex items-start w-[42px] h-[42px]">
                        <div className="flex w-[42px] items-start rounded-full bg-black/5">
                          <div className="w-[42px] h-[42px] rounded-full bg-gray-300"></div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start flex-1">
                        <div className="text-[#0A0B1E] font-medium text-base leading-6">
                          Jessica Campbell
                        </div>
                        <div className="text-[#171945] font-normal text-sm leading-5 flex px-0 py-[1px] items-start">
                          Program Manager in EdTech
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-2 opacity-90">
                      <p className="flex flex-col justify-end text-[#0A0B1E] font-normal text-base leading-6 tracking-[-0.4px] items-start gap-[23px]">
                        SummifyAI is such an amazing tool! Not only is the UI
                        perfect but the entire experience is so thoughtfully
                        designed for discovering book insights. The comparative
                        analysis feature helps me understand different
                        perspectives quickly.
                      </p>
                    </div>
                    <div className="text-gray-500 text-xs">Feb 8, 2024</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="flex w-[306px] items-start rounded-2xl bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.07)] h-[399px] col-span-1 row-span-1">
                <div className="flex w-full p-[17px] items-start rounded-2xl border border-[#E6E6E6] bg-transparent shadow-[0px_1px_2px_0px_rgba(0,0,0,0.07)]">
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex pr-4 items-center gap-3 w-full mb-2">
                      <div className="flex items-start w-[42px] h-[42px]">
                        <div className="flex w-[42px] items-start rounded-full bg-black/5">
                          <div className="w-[42px] h-[42px] rounded-full bg-gray-300"></div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start flex-1">
                        <div className="text-[#0A0B1E] font-medium text-base leading-6">
                          Natalie Pearce
                        </div>
                        <div className="text-[#171945] font-normal text-sm leading-5 flex px-0 py-[1px] items-start">
                          Learning & Development
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-2 opacity-90">
                      <p className="flex flex-col justify-end text-[#0A0B1E] font-normal text-base leading-6 tracking-[-0.4px] items-start gap-[23px]">
                        I absolutely LOVE SummifyAI! This beautiful platform has
                        changed how we approach learning by enabling us to
                        discover book insights in ways we'd only dreamed of. The
                        affiliate system is a bonus!
                      </p>
                    </div>
                    <div className="text-gray-500 text-xs">Feb 7, 2024</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="flex w-[306px] items-start rounded-2xl bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.07)] h-[186px] col-span-1 row-span-1">
                <div className="flex w-full p-[17px] items-start rounded-2xl border border-[#E6E6E6] bg-transparent shadow-[0px_1px_2px_0px_rgba(0,0,0,0.07)]">
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex pr-4 items-center gap-3 w-full mb-2">
                      <div className="flex flex-col items-start flex-1">
                        <div className="text-[#0A0B1E] font-medium text-base leading-6">
                          Sarah K. 📚 Book Lover
                        </div>
                        <div className="text-gray-600 text-sm">
                          @bookworm_sarah
                        </div>
                      </div>
                      <div className="flex items-start w-[42px] h-[42px]">
                        <div className="flex w-[42px] items-start rounded-full bg-black/5">
                          <div className="w-[42px] h-[42px] rounded-full bg-gray-300"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-2 opacity-90 text-sm">
                      SummifyAI beats every other book summary tool out there
                    </div>
                    <div className="text-gray-500 text-xs flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>2</span>
                      <span>Jan 29, 2024</span>
                    </div>
                  </div>
                </div>
              </div>
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
            Join thousands of readers who use SummifyAI to discover, compare,
            and share book insights.
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
