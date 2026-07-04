export function AboutPage(): JSX.Element {
  return (
    <section className="about-page panel-wide">
      <p className="eyebrow">About</p>
      <h1>Original Spanish MTEL-style practice</h1>
      <p>
        This app is an independent study tool for Spanish MTEL preparation. It is not affiliated with, endorsed by, or connected to the
        official MTEL program, Evaluation Systems, Pearson, or the Massachusetts Department of Elementary and Secondary Education.
      </p>
      <p>
        The question bank is original and designed to mimic broad task types: listening comprehension, reading comprehension, language
        structures, linguistics, grammar, cultural perspectives, cultural comparisons, writing strategy, and oral-response strategy.
        All practice questions in this app are multiple choice. It does not copy
        official MTEL questions or copyrighted passages.
      </p>
      <p>
        All learner progress stays in the browser through IndexedDB. There is no backend server, no analytics, no external API, and no
        external service that stores answers.
      </p>
    </section>
  );
}
