import Link from "next/link"
import Image from "next/image"

const navLinks = [
  { href: "/about", label: "교회소개" },
  { href: "/sermons", label: "설교영상" },
  { href: "/blog", label: "블로그" },
]

const infoLinks = [
  { href: "/praise", label: "찬양콘티" },
  { href: "/bulletin", label: "주보" },
  { href: "/columns", label: "설교칼럼" },
]

export function Footer() {
  return (
    <footer className="bg-[#f5f3f0] w-full py-16 px-6 lg:px-12 border-t border-[#e4e2df]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-screen-2xl mx-auto">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Image
              src="/images/logo_dark.png"
              alt="동남생명의빛교회"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
            <span className="font-serif text-xl font-semibold text-[#022448]">
              동남생명의빛교회
            </span>
          </div>
          <p className="text-[#1e3a5f]/70 text-sm leading-relaxed max-w-xs mb-8">
            이름을 불러주는 따뜻한 교회.
            <br />
            충북 청주시 상당구에서 15명의 가족이
            <br />
            하나님의 사랑 안에서 함께 성장합니다.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-[#c4c6cf] flex items-center justify-center text-[#022448] hover:bg-[#022448] hover:text-white transition-all"
              aria-label="YouTube"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-[#c4c6cf] flex items-center justify-center text-[#022448] hover:bg-[#022448] hover:text-white transition-all"
              aria-label="Blog"
            >
              <span className="material-symbols-outlined text-xl">edit_note</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h5 className="text-[#022448] font-bold text-xs uppercase tracking-widest mb-6">
              둘러보기
            </h5>
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#1e3a5f]/70 hover:text-[#795900] hover:underline underline-offset-4 text-sm transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-[#022448] font-bold text-xs uppercase tracking-widest mb-6">
              리소스
            </h5>
            <ul className="space-y-4">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#1e3a5f]/70 hover:text-[#795900] hover:underline underline-offset-4 text-sm transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h5 className="text-[#022448] font-bold text-xs uppercase tracking-widest mb-4">
              오시는 길
            </h5>
            <p className="text-[#1e3a5f]/70 text-sm leading-relaxed mb-2">
              충북 청주시 상당구
              <br />
              동남생명의빛교회
            </p>
            <p className="text-[#1e3a5f]/70 text-sm">담임목사 홍은익</p>
          </div>
          <div className="pt-8 text-xs text-[#1e3a5f]/50 md:text-right">
            © {new Date().getFullYear()} 동남생명의빛교회. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
