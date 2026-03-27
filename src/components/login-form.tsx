import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import {Code2, ShieldAlert} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0 border-primary/20 shadow-lg">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8 flex flex-col justify-center">
                        <FieldGroup className="gap-6">

                            {/* Header Section */}
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div
                                    className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-2">
                                    <Code2 className="w-6 h-6 text-emerald-500"/>
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    AlgoTutor Admin
                                </h1>
                                <p className="text-balance text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                                    <ShieldAlert className="w-4 h-4 text-destructive"/>
                                    Restricted Access. Staff only.
                                </p>
                            </div>

                            {/* Form Fields */}
                            <Field className="space-y-2">
                                <FieldLabel htmlFor="email">Staff Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@algotutor.dev"
                                    required
                                    className="font-mono text-sm" // Monospace font for a tech feel
                                />
                            </Field>

                            <Field className="space-y-2">
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Link
                                        href="#"
                                        className="ml-auto text-xs font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    className="font-mono text-sm"
                                />
                            </Field>

                            <Field>
                                <Button type="submit" className="w-full font-semibold">
                                    Authenticate Session
                                </Button>
                            </Field>

                            <p className="text-center text-xs text-muted-foreground mt-4">
                                By logging in, you agree to the platform&#39;s strictly confidential data handling
                                policy.
                            </p>
                        </FieldGroup>
                    </form>

                    {/* Right Side - Image/Graphic */}
                    <div className="relative hidden bg-zinc-950 md:flex items-center justify-center p-8">
                        {/* Using a tech-focused Unsplash image for the placeholder */}
                        <Image
                            src={"/placeholder.avif"}
                            alt="Algorithm Code Visualization"
                            className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
                            fill
                            sizes={"(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                            priority
                        />
                        {/* Overlay Graphic / Quote */}
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4 text-zinc-300">
                            <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-950/50 backdrop-blur-sm">
                  <pre className="text-xs font-mono text-emerald-400 text-left">
                    <code>
                      {`function optimize(algo) {`} <br/>
                        {`  return BigO.O(1);`} <br/>
                        {`}`}
                    </code>
                  </pre>
                            </div>
                            <blockquote className="text-sm font-medium leading-relaxed max-w-xs">
                                &#34;Manage course modules, monitor student execution times, and oversee platform
                                analytics.&#34;
                            </blockquote>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}