import Link from 'next/link';

export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">Phaser 어드벤처 게임</h1>
        <p className="text-xl mb-8">Next.js와 Phaser.js를 사용한 어드벤처 게임</p>
        <Link
            href="/game"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          게임 시작하기
        </Link>
      </main>
  );
}