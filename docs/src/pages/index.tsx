import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import CodeBlock from "@theme/CodeBlock";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";

import styles from "./index.module.css";

function HomepageHeader() {
	const { siteConfig } = useDocusaurusContext();

	return (
		<header className={clsx("hero hero--primary", styles.heroBanner)}>
			<div className="container">
				<Heading as="h1" className="hero__title">
					{siteConfig.title}
				</Heading>
				<p className="hero__subtitle">{siteConfig.tagline}</p>
				<div className={styles.buttons}>
					<Link
						className="button button--secondary button--lg"
						to="/docs/intro"
					>
						Documentation
					</Link>
				</div>
			</div>
		</header>
	);
}

export default function Home(): JSX.Element {
	const { siteConfig } = useDocusaurusContext();
	return (
		<Layout
			title={`Hello from ${siteConfig.title}`}
			description="Description will go into a meta tag in <head />"
		>
			<HomepageHeader />

			<main className={`container ${styles.liveContainer}`}>
				<CodeBlock {...({ live: true, noInline: true } as any)}>
					{
						/* ts */ `


const [iterator, dispatch] = asxnc.queue();

const Log = () => {
  const [output, setOutput] = useState("");

  useEffect(() => {
    (async () => {
      for await (const line of iterator) {
        setOutput((s) => s + line + "\\n");
      }
    })();
  }, []);

  return (
    <div style={{ maxHeight: "400px", overflow: "scroll" }}>
      <pre>{output}</pre>
    </div>
  );
};

(async () => {
  while (true) {
    await asxnc.wait(500);
    // dispatch({ value: Math.random(), done: false });
  }
})();

render(<Log />);


      `.trim()
					}
				</CodeBlock>
			</main>
		</Layout>
	);
}
