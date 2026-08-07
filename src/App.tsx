import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-svh flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <span className="text-lg font-semibold tracking-tight">
            Deal Analyzer
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Evaluate flip deals in seconds.
          </h1>
          <p className="text-muted-foreground text-balance">
            Shared deal analysis for the group — coming together step by
            step.
          </p>
          <Button>Get started</Button>
        </div>
      </main>
    </div>
  )
}

export default App
