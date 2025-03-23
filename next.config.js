/** @type {import('next').NextConfig} */
const nextConfig = {
    // React Strict Mode 비활성화 - 개발 모드에서 useEffect를 두 번 실행하는 것을 방지
    reactStrictMode: false,

    webpack: (config) => {
        // Phaser에 필요한 웹팩 설정 추가
        config.module.rules.push({
            test: /\.js$/,
            include: /node_modules\/phaser/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        });
        return config;
    },

    // 정적 내보내기 설정 (모바일 앱 빌드용)
    output: 'export',

    // Next.js 13 이상에서는 appDir 옵션이 기본적으로 활성화될 수 있으므로 명시적으로 비활성화
    experimental: {
        appDir: false,
    }
};

export default nextConfig;