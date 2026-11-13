import SplitText from "./components/SplitText";

function App() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6 py-20 text-center">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          React Bits · SplitText
        </p>
        <SplitText
          text="Hare Ram"
          tag="h1"
          splitType="chars"
          effect="rise"
          delay={55}
          duration={0.9}
          className="text-6xl font-semibold tracking-tight text-foreground sm:text-8xl"
        />
        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
          An animated text component running in a separate React app. The
          existing portfolio remains unchanged.
        </p>
      </section>
    </main>
  );
}

export default App;
