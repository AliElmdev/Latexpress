import Head from "next/head";

export default function Meta({ title, keywords, description }) {
    const homepage = "https://latexpress.vercel.app/";
    const logo = "https://latexpress.vercel.app/assets/logo.png";
    const fevicon = "https://latexpress.vercel.app/assets/favicon.ico";

    function isiteJsonLd() {
        return {
            __html: `{
                "@context": "https://schema.org",
                "@type": "Organization",
                "url": "${homepage}",
                "logo": "${logo}",
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+33 656 68 67 02",
                    "contactType": "customer service"
                },
                "image": "${logo}",
                "description": "${description}",
                "founder": "Ali El Makhroubi",
                "foundingDate": "2023",
                "foundingLocation": "FR",
                "email": "alielmakhroubi01@gmail.com",
                "telephone": "+33 656 68 67 02",
                "areaServed": "FR",
                "keywords": "${keywords}",
                "mainEntityOfPage": "${homepage}",
                "knowsAbout": "${keywords}",
                "knowsLanguage": "English",
                "memberOf": "Ali El Makhroubi",
                "owns": "Ali El Makhroubi",
                "publishingPrinciples": "${homepage}",
                "slogan": "Get hired with a LaTeX-optimized resume"
            }`
        }
    }

    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="keywords" content={keywords} />
            <meta name="description" content={description} />
            <meta charSet="utf-8" />
            <link rel="icon" href={fevicon} />
            <title>{title}</title>
            <meta type="copyright" content="Latexpress" />
            <meta type="author" content="Ali El Makhroubi" />
            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={homepage} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={logo} />
            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={homepage} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={logo} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={isiteJsonLd()}
                key="isiteJsonLd"
            />
        </Head>
    );
}
