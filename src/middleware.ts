import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/login(.*)", "/register(.*)", "/sso-callback(.*)"]);
const isAuthRoute = createRouteMatcher(["/login(.*)", "/register(.*)"]);

export default clerkMiddleware(async (auth, request) => {
    const { userId } = await auth();

    // If user is logged in and trying to access login/register, redirect to dashboard
    if (userId && isAuthRoute(request)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If user is not logged in and trying to access a private route, redirect to login
    if (!userId && !isPublicRoute(request)) {
        return auth().then(a => a.redirectToSignIn());
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
