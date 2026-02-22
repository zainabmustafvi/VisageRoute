UI/UX Strategy: "Stitch-to-Native" Implementation
Design Source: Custom UI designed via Google Stitch (HTML/CSS-based).

Styling Engine: StyleSheet in React Native with a centralized Theme.js.

Asset Management: UI icons and student profile images stored in Cloudinary or Firebase Storage for high-speed delivery.

Consistency: The Node.js server will serve consistent data schemas that the React Native UI will render based on the provided HTML structure.

Security Consideration for UI
Since your security prompt (from the image) requires Strict Input Validation, ensure your UI code handles errors visually:

Graceful 429s: When rate-limiting kicks in, the UI must show a "Too many attempts, please wait" toast message instead of crashing.

Sanitization Feedback: If a user enters invalid characters in a name field, the UI should highlight the field in red before the data even reaches the Node.js server.

below is the stitch code for the UI:

SPLASH SCREEN:



<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>SafeRoute Splash Screen</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                        "brand-grey": "#1c190d",
                        "brand-white": "#ffffff"
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom animations for the splash screen effect */
        @keyframes fadeInScale {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideUp {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
        }

        .animate-logo {
            animation: fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-text {
            animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
            opacity: 0; /* Start invisible */
        }
        
        .animate-footer {
            animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
            opacity: 0; /* Start invisible */
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-primary font-display antialiased overflow-hidden">
<!-- Main Container -->
<div class="relative flex h-screen w-full flex-col items-center justify-between p-6">
<!-- Top spacer for centering -->
<div class="flex-1"></div>
<!-- Central Brand Content -->
<div class="flex flex-col items-center justify-center gap-6 w-full max-w-xs z-10">
<!-- Logo Container -->
<div class="relative w-32 h-32 flex items-center justify-center bg-brand-white/20 rounded-full backdrop-blur-sm animate-logo shadow-lg ring-4 ring-white/30">
<!-- Icon: Bus or Map Pin -->
<span class="material-symbols-outlined text-brand-grey text-[64px]" style="font-variation-settings: 'FILL' 1, 'wght' 600;">
                    directions_bus
                </span>
</div>
<!-- Text Content -->
<div class="flex flex-col items-center animate-text text-center">
<!-- App Name -->
<h1 class="text-brand-grey tracking-tight text-4xl font-extrabold leading-tight mb-2">
                    SafeRoute
                </h1>
<!-- Tagline -->
<p class="text-brand-grey/80 text-lg font-medium leading-relaxed max-w-[240px]">
                    Your Campus Commute, <br/> Tracked.
                </p>
</div>
</div>
<!-- Bottom spacer with Loading Indicator & Footer -->
<div class="flex-1 flex flex-col items-center justify-end w-full gap-8 animate-footer pb-8">
<!-- Loading Indicator -->
<div class="w-12 h-12 relative flex items-center justify-center">
<svg class="animate-spin h-8 w-8 text-brand-grey" fill="none" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
<path class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
</svg>
</div>
<!-- Version Info -->
<p class="text-brand-grey/60 text-xs font-medium tracking-widest uppercase">
                v1.0
            </p>
</div>
<!-- Abstract Background Pattern (Subtle Map Lines) -->
<div class="absolute inset-0 pointer-events-none opacity-10 z-0 overflow-hidden">
<!-- Abstract decorative circles simulating radar or map zones -->
<div class="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] rounded-full border-[2px] border-brand-grey"></div>
<div class="absolute top-[-5%] right-[-15%] w-[300px] h-[300px] rounded-full border-[2px] border-brand-grey"></div>
<div class="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] rounded-full border-[2px] border-brand-grey"></div>
<div class="absolute bottom-[-5%] left-[-15%] w-[300px] h-[300px] rounded-full border-[2px] border-brand-grey"></div>
</div>
</div>
</body></html>


LOGIN SCREEN:
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>SafeRoute Login</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                    },
                    fontFamily: {
                        "display": ["Inter", "Noto Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        body {
          min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="font-display bg-background-light dark:bg-background-dark text-[#1c190d] dark:text-white overflow-x-hidden antialiased">
<div class="relative flex h-full min-h-screen w-full flex-col group/design-root">
<div class="w-full bg-primary/20 dark:bg-primary/10">
<div class="@container">
<div class="@[480px]:px-4 @[480px]:py-3">
<div class="relative flex flex-col justify-end overflow-hidden h-[240px] @[480px]:rounded-lg bg-cover bg-center" data-alt="Yellow school bus abstract geometric pattern" style='background-image: linear-gradient(180deg, rgba(242, 204, 13, 0.1) 0%, rgba(248, 248, 245, 1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBov1jEAahVVOi7xXqnIHiTRv0nJWhTm8TGreQc8TEpS0ieLeAqoBpUcDV5BB5VVzeZrluRv2XBzXx0BK6XaDnVdM6umeM_G-WRdLi-Lb1SMbNOAEAdnee0AXXfyXv6kfn0i340wIWstwWwZeanG8DrYqqzdqxWqdxex-hU4QBQMAHX_6xMqC9YxOlDSyYGlI81lt02unydCbs_p3Qrl8SSnL1-D30b4Pp6kjR856p_RURFozSHHN-sdOamr8GHiaTUDj6o5Pp2P8Q");'>
<div class="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent"></div>
<div class="relative z-10 flex flex-col items-center p-6 text-center">
<div class="mb-2 flex items-center justify-center h-16 w-16 rounded-full bg-primary text-[#1c190d] shadow-lg">
<span class="material-symbols-outlined text-4xl">directions_bus</span>
</div>
<h1 class="text-[#1c190d] dark:text-white tracking-tight text-3xl font-bold leading-tight">SafeRoute</h1>
<p class="text-[#1c190d]/70 dark:text-white/70 text-sm font-medium mt-1">Track your campus ride</p>
</div>
</div>
</div>
</div>
</div>
<div class="flex-1 flex flex-col px-6 -mt-4 relative z-20">
<h2 class="text-[#1c190d] dark:text-white tracking-tight text-[28px] font-bold leading-tight text-center pb-2 pt-2">Welcome Back!</h2>
<p class="text-[#1c190d]/60 dark:text-white/60 text-base font-normal leading-normal pb-8 text-center">Please sign in to continue</p>
<form class="flex flex-col gap-5 max-w-[480px] w-full mx-auto" onsubmit="event.preventDefault();">
<div class="flex flex-col gap-2">
<p class="text-[#1c190d] dark:text-white text-sm font-semibold leading-normal ml-1">Select Role</p>
<div class="flex flex-row gap-6 px-1">
<label class="inline-flex items-center cursor-pointer">
<input checked="" class="form-radio text-primary focus:ring-primary focus:ring-offset-0 border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 h-5 w-5 transition-all duration-200" name="role" type="radio" value="parent"/>
<span class="ml-2 text-[#1c190d] dark:text-white text-sm font-medium">Parent</span>
</label>
<label class="inline-flex items-center cursor-pointer">
<input class="form-radio text-primary focus:ring-primary focus:ring-offset-0 border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 h-5 w-5 transition-all duration-200" name="role" type="radio" value="driver"/>
<span class="ml-2 text-[#1c190d] dark:text-white text-sm font-medium">Driver</span>
</label>
<label class="inline-flex items-center cursor-pointer">
<input class="form-radio text-primary focus:ring-primary focus:ring-offset-0 border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 h-5 w-5 transition-all duration-200" name="role" type="radio" value="admin"/>
<span class="ml-2 text-[#1c190d] dark:text-white text-sm font-medium">Admin</span>
</label>
</div>
</div>
<label class="flex flex-col flex-1">
<p class="text-[#1c190d] dark:text-white text-sm font-semibold leading-normal pb-2 ml-1">User ID</p>
<div class="relative">
<div class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c8e49] dark:text-[#f2cc0d]/70">
<span class="material-symbols-outlined text-[20px]">person</span>
</div>
<input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1c190d] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary h-14 placeholder:text-[#9c8e49]/60 dark:placeholder:text-white/30 pl-11 pr-4 text-base font-normal leading-normal transition-all duration-200" placeholder="Enter User ID" type="text" value="PR12345"/>
</div>
</label>
<label class="flex flex-col flex-1">
<div class="flex justify-between items-center pb-2 ml-1">
<p class="text-[#1c190d] dark:text-white text-sm font-semibold leading-normal">Password</p>
</div>
<div class="relative">
<div class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c8e49] dark:text-[#f2cc0d]/70">
<span class="material-symbols-outlined text-[20px]">lock</span>
</div>
<input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1c190d] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary h-14 placeholder:text-[#9c8e49]/60 dark:placeholder:text-white/30 pl-11 pr-12 text-base font-normal leading-normal transition-all duration-200" placeholder="••••••••" type="password" value=""/>
<button class="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c8e49] dark:text-[#f2cc0d]/70 hover:text-primary transition-colors" type="button">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
</div>
</label>
<div class="flex justify-end -mt-2">
<a class="text-sm font-medium text-primary hover:text-primary/80 transition-colors" href="#">Forgot Password?</a>
</div>
<div class="pt-4">
<button class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-primary text-[#1c190d] text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md shadow-primary/20">
<span class="truncate">Log In</span>
</button>
</div>
</form>
<div class="mt-auto pb-8 pt-8">
<div class="flex items-center justify-center gap-2 text-xs text-[#1c190d]/40 dark:text-white/40">
<span class="material-symbols-outlined text-[16px]">support_agent</span>
<span>Need help? Contact Transport Dept.</span>
</div>
</div>
</div>
</div>
</body></html>





ADMIN SCREENS:




<!-- Admin Make Announcement -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>SafeRoute - Admin Announcement</title>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Noto+Sans:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Config -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                        "surface-light": "#ffffff",
                        "surface-dark": "#2c2815",
                    },
                    fontFamily: {
                        "display": ["Inter", "Noto Sans", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for cleaner look */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background-color: #e5e7eb;
            border-radius: 20px;
        }
        .dark ::-webkit-scrollbar-thumb {
            background-color: #374151;
        }
        
        /* IOS Toggle Switch */
        .toggle-checkbox:checked {
            right: 0;
            border-color: #f2cc0d;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #f2cc0d;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-[#1c190d] dark:text-[#fcfbf8] h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-black">
<!-- Top Navigation Bar (iOS Style) -->
<header class="flex items-center justify-between px-4 pt-4 pb-2 bg-background-light dark:bg-background-dark border-b border-gray-200/50 dark:border-white/10 shrink-0 z-10">
<button class="text-gray-500 dark:text-gray-400 text-base font-medium hover:text-gray-800 dark:hover:text-gray-200 transition-colors py-2 px-1">
            Cancel
        </button>
<h2 class="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">New Announcement</h2>
<button class="text-primary text-base font-semibold py-2 px-1 opacity-50 cursor-not-allowed">
<!-- Hidden Preview or disabled state for visual balance -->
</button>
</header>
<!-- Scrollable Main Content -->
<main class="flex-1 overflow-y-auto w-full max-w-md mx-auto relative">
<!-- Audience Selection Section -->
<div class="px-4 pt-6 pb-2">
<h3 class="text-[#1c190d] dark:text-white tracking-tight text-xl font-bold leading-tight mb-3">Select Audience</h3>
<div class="flex gap-2 flex-wrap">
<!-- Selected Chip -->
<button class="group flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary pl-4 pr-4 transition-all shadow-sm ring-2 ring-primary ring-offset-1 ring-offset-background-light dark:ring-offset-background-dark">
<span class="material-symbols-outlined text-black text-[18px]">check</span>
<p class="text-black text-sm font-medium leading-normal">All Users</p>
</button>
<!-- Unselected Chips -->
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 pl-4 pr-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
<p class="text-gray-600 dark:text-gray-300 text-sm font-medium leading-normal">Drivers</p>
</button>
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 pl-4 pr-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
<p class="text-gray-600 dark:text-gray-300 text-sm font-medium leading-normal">Students</p>
</button>
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 pl-4 pr-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
<p class="text-gray-600 dark:text-gray-300 text-sm font-medium leading-normal">Route A</p>
</button>
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-dashed border-gray-300 dark:border-white/20 pl-3 pr-4 hover:border-primary text-gray-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[18px]">add</span>
<p class="text-sm font-medium leading-normal">Custom</p>
</button>
</div>
</div>
<div class="h-4 w-full"></div>
<!-- Input Fields -->
<div class="px-4 space-y-5">
<!-- Subject Field -->
<div class="group">
<label class="block text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal mb-2 ml-1">Subject</label>
<div class="relative">
<input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1c190d] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:border-primary h-14 placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal shadow-sm transition-all" placeholder="e.g. Bus Schedule Change" type="text" value=""/>
</div>
</div>
<!-- Message Body Field -->
<div class="group">
<div class="flex justify-between items-end mb-2 ml-1">
<label class="block text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">Message Body</label>
<span class="text-xs text-gray-400">0/500</span>
</div>
<textarea class="form-textarea flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1c190d] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:border-primary min-h-[160px] placeholder:text-gray-400 p-[15px] text-base font-normal leading-relaxed shadow-sm transition-all" placeholder="Write your update here... Be clear and concise."></textarea>
</div>
</div>
<div class="h-6 w-full"></div>
<!-- Delivery Settings & Priority -->
<div class="px-4 mb-24">
<h3 class="text-[#1c190d] dark:text-white tracking-tight text-lg font-bold leading-tight mb-3">Delivery Options</h3>
<div class="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
<!-- Urgent Toggle -->
<div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
<div class="flex items-center gap-3">
<div class="size-10 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
<span class="material-symbols-outlined">priority_high</span>
</div>
<div class="flex flex-col">
<p class="text-[#1c190d] dark:text-white font-semibold">Mark as Urgent</p>
<p class="text-xs text-gray-500 dark:text-gray-400">Sends high priority alert to devices</p>
</div>
</div>
<!-- Switch Component -->
<div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
<input class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 dark:border-gray-600 transition-all duration-300" id="urgent-toggle" name="toggle" type="checkbox"/>
<label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer transition-colors duration-300" for="urgent-toggle"></label>
</div>
</div>
<!-- Channels -->
<div class="p-4 space-y-3">
<label class="flex items-center space-x-3 cursor-pointer group">
<input checked="" class="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary dark:bg-white/5 dark:border-gray-600 transition duration-150 ease-in-out" type="checkbox"/>
<span class="text-gray-900 dark:text-gray-200 font-medium text-sm group-hover:text-primary transition-colors">Push Notification</span>
</label>
<label class="flex items-center space-x-3 cursor-pointer group">
<input class="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary dark:bg-white/5 dark:border-gray-600 transition duration-150 ease-in-out" type="checkbox"/>
<span class="text-gray-900 dark:text-gray-200 font-medium text-sm group-hover:text-primary transition-colors">SMS Text Message</span>
</label>
<label class="flex items-center space-x-3 cursor-pointer group">
<input class="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary dark:bg-white/5 dark:border-gray-600 transition duration-150 ease-in-out" type="checkbox"/>
<span class="text-gray-900 dark:text-gray-200 font-medium text-sm group-hover:text-primary transition-colors">Email</span>
</label>
</div>
</div>
</div>
</main>
<!-- Sticky Footer Action Bar -->
<footer class="bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 p-4 pb-8 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
<div class="flex gap-3 max-w-md mx-auto">
<button class="flex-1 py-3.5 px-6 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold text-base hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                Preview
            </button>
<button class="flex-[2] py-3.5 px-6 rounded-xl bg-primary text-[#1c190d] font-bold text-base shadow-lg shadow-primary/20 hover:brightness-105 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                Send Announcement
                <span class="material-symbols-outlined text-[20px] font-bold">send</span>
</button>
</div>
</footer>
</body></html>

<!-- Admin Register Driver -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Register Driver - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }.no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-[#1c190d] dark:text-gray-100 h-screen flex flex-col overflow-hidden">
<header class="flex items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 z-10 shrink-0">
<button class="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
<span class="material-symbols-outlined text-gray-900 dark:text-white">arrow_back_ios_new</span>
</button>
<h2 class="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-2">Register Driver</h2>
<button class="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Cancel
        </button>
</header>
<main class="flex-1 overflow-y-auto no-scrollbar pb-32">
<div class="px-4 pt-6 flex flex-col gap-6">
<div class="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
<div class="flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-primary">person</span>
<h3 class="text-base font-bold text-gray-900 dark:text-white">Personal Information</h3>
</div>
<div class="flex flex-col gap-4">
<label class="flex flex-col w-full">
<span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</span>
<input class="form-input w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 placeholder-gray-400 text-base" placeholder="ex. Sadaat Malik" type="text"/>
</label>
<label class="flex flex-col w-full">
<span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</span>
<input class="form-input w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 placeholder-gray-400 text-base" placeholder="(555) 000-0000" type="tel"/>
</label>
<label class="flex flex-col w-full">
<span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</span>
<input class="form-input w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 placeholder-gray-400 text-base" placeholder="driver@saferoute.edu" type="email"/>
</label>
<label class="flex flex-col w-full">
<span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Employee ID</span>
<input class="form-input w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 placeholder-gray-400 text-base" placeholder="ID-123456" type="text"/>
</label>
</div>
</div>
<div class="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
<div class="flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-primary">badge</span>
<h3 class="text-base font-bold text-gray-900 dark:text-white">License Details</h3>
</div>
<div class="flex flex-col gap-4">
<label class="flex flex-col w-full">
<span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">License Number</span>
<input class="form-input w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 placeholder-gray-400 text-base" placeholder="DL-88997766" type="text"/>
</label>
<div class="flex gap-4">
<label class="flex flex-col w-1/2">
<span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Class</span>
<div class="relative">
<select class="form-select w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 text-base appearance-none">
<option>Class A</option>
<option>Class B</option>
<option selected="">Class C</option>
</select>
</div>
</label>
<label class="flex flex-col w-1/2">
<span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Expiration</span>
<input class="form-input w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 placeholder-gray-400 text-base" type="date"/>
</label>
</div>
</div>
</div>
<div class="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 mb-4">
<div class="flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-primary">directions_bus</span>
<h3 class="text-base font-bold text-gray-900 dark:text-white">Bus Assignment</h3>
</div>
<div class="flex flex-col gap-4">
<label class="flex flex-col w-full">
<span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Assigned Route</span>
<div class="relative">
<select class="form-select w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-primary h-14 pl-12 pr-4 text-base appearance-none truncate">
<option disabled="" selected="" value="">Select a route...</option>
<option>Route 101 - North Campus Loop</option>
<option>Route 204 - Downtown Connector</option>
<option>Route 305 - Stadium Shuttle</option>
<option>Unassigned (Pool)</option>
</select>
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">route</span>
<span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
</div>
</label>
</div>
</div>
</div>
</main>
<div class="fixed bottom-0 left-0 w-full bg-background-light dark:bg-background-dark p-4 border-t border-gray-200 dark:border-gray-800 z-20 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95">
<button class="w-full bg-primary hover:bg-[#d9b70b] text-black font-bold text-lg h-14 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99]">
<span class="material-symbols-outlined">check_circle</span>
            Register Driver
        </button>
</div>
</body></html>

<!-- Admin Upload Bus Schedule -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Upload Bus Schedule</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                        "surface-light": "#ffffff",
                        "surface-dark": "#2d2a1d",
                        "text-main-light": "#1c190d",
                        "text-main-dark": "#fcfbf8",
                        "text-secondary-light": "#6b6651",
                        "text-secondary-dark": "#ada892",
                        "border-light": "#e8e4ce",
                        "border-dark": "#4a4630",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-main-light dark:text-text-main-dark antialiased transition-colors duration-200">
<div class="relative flex min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto border-x border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-xl">
<!-- Header -->
<div class="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 border-b border-border-light dark:border-border-dark justify-between">
<div class="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
<span class="material-symbols-outlined text-text-main-light dark:text-text-main-dark">arrow_back_ios_new</span>
</div>
<h2 class="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Upload Schedule</h2>
</div>
<!-- Scrollable Content -->
<div class="flex-1 overflow-y-auto p-4 flex flex-col gap-6 pb-24">
<!-- Instructions Section -->
<div class="flex flex-col gap-3">
<p class="text-text-main-light dark:text-text-main-dark text-base font-normal leading-normal">
                    Please upload the bus schedule in Excel or CSV format. Ensure all columns match the provided template.
                </p>
<button class="flex w-full items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
<span class="material-symbols-outlined text-xl text-primary">download</span>
<span>Download Template</span>
</button>
</div>
<!-- Upload Zone -->
<div class="flex flex-col">
<div class="relative flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-6 py-10 transition-colors hover:border-primary/50 group cursor-pointer">
<div class="flex size-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
<span class="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
</div>
<div class="flex flex-col items-center gap-1">
<p class="text-lg font-bold text-center">Tap to upload</p>
<p class="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center">or drag and drop your file here</p>
</div>
<span class="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark bg-background-light dark:bg-background-dark px-2 py-1 rounded">Max size: 5MB</span>
</div>
</div>
<!-- Mock State: File Selected (Hidden in empty state, visible here for design) -->
<!-- Uncomment logic would toggle between upload zone and this file preview -->
<div class="flex flex-col gap-2">
<label class="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Ready to Upload</label>
<div class="flex items-center gap-3 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-3 shadow-sm">
<div class="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 shrink-0">
<span class="material-symbols-outlined text-green-600 dark:text-green-400">description</span>
</div>
<div class="flex flex-1 flex-col overflow-hidden">
<p class="truncate text-sm font-medium text-text-main-light dark:text-text-main-dark">Spring_Semester_2024_Final.csv</p>
<p class="text-xs text-text-secondary-light dark:text-text-secondary-dark">2.4 MB</p>
</div>
<button class="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500 dark:hover:text-red-400 transition-colors">
<span class="material-symbols-outlined text-xl">delete</span>
</button>
</div>
</div>
<!-- Recent Activity -->
<div class="flex flex-col gap-3 mt-2">
<div class="flex items-center justify-between">
<h3 class="text-base font-bold text-text-main-light dark:text-text-main-dark">Recent Activity</h3>
<button class="text-xs font-medium text-primary hover:text-yellow-600 transition-colors">View All</button>
</div>
<!-- Processing Item -->
<div class="flex flex-col gap-3 rounded-xl bg-surface-light dark:bg-surface-dark p-3 shadow-sm border border-border-light dark:border-border-dark">
<div class="flex items-center gap-3">
<div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
<span class="material-symbols-outlined text-primary animate-pulse">upload_file</span>
</div>
<div class="flex-1 overflow-hidden">
<p class="truncate text-sm font-medium text-text-main-light dark:text-text-main-dark">Fall_2024_Draft_v2.xlsx</p>
<p class="text-xs text-primary font-medium">Uploading...</p>
</div>
</div>
<!-- Progress Bar -->
<div class="flex items-center gap-3 pl-[3.25rem]">
<div class="h-1.5 w-full rounded-full bg-background-light dark:bg-background-dark overflow-hidden">
<div class="h-full w-[45%] rounded-full bg-primary"></div>
</div>
<span class="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">45%</span>
</div>
</div>
<!-- Completed Item 1 -->
<div class="flex items-center gap-3 rounded-xl bg-surface-light dark:bg-surface-dark p-3 shadow-sm border border-border-light dark:border-border-dark">
<div class="flex size-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 shrink-0">
<span class="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">table_chart</span>
</div>
<div class="flex flex-1 flex-col overflow-hidden">
<p class="truncate text-sm font-medium text-text-main-light dark:text-text-main-dark">Fall_Semester_2023.csv</p>
<div class="flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
<span>Oct 24, 2023</span>
<span class="size-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
<span class="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
<span class="material-symbols-outlined text-[14px]">check_circle</span>
                                Active
                            </span>
</div>
</div>
<button class="p-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
<!-- Completed Item 2 -->
<div class="flex items-center gap-3 rounded-xl bg-surface-light dark:bg-surface-dark p-3 shadow-sm border border-border-light dark:border-border-dark opacity-75">
<div class="flex size-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 shrink-0">
<span class="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">table_chart</span>
</div>
<div class="flex flex-1 flex-col overflow-hidden">
<p class="truncate text-sm font-medium text-text-main-light dark:text-text-main-dark">Summer_Schedule_2023.xlsx</p>
<div class="flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
<span>May 15, 2023</span>
<span class="size-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
<span class="font-medium text-gray-500">Archived</span>
</div>
</div>
<button class="p-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
</div>
<!-- Sticky Footer Action -->
<div class="sticky bottom-0 z-40 w-full border-t border-border-light dark:border-border-dark bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4">
<button class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary h-12 px-4 text-[#1c190d] text-base font-bold leading-normal tracking-wide shadow-md hover:bg-yellow-400 active:scale-[0.98] transition-all">
<span class="material-symbols-outlined">publish</span>
<span class="truncate">Upload &amp; Publish</span>
</button>
</div>
</div>
</body></html>

<!-- Admin Dashboard Home, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Driver List &amp; Management - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            yellow: '#F59E0B', 
                            dark: '#111827',
                            gray: '#F3F4F6',
                        }
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 h-screen w-full flex justify-center items-center overflow-hidden">
<div class="w-full h-full max-w-md bg-gray-50 relative flex flex-col shadow-2xl overflow-hidden">
<div class="bg-white w-full h-12 flex justify-between items-end px-6 pb-2 text-xs font-medium text-gray-900 z-50">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
<div class="flex items-center gap-4">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-600 transition-colors group">
<span class="material-symbols-outlined text-2xl group-hover:text-yellow-600">menu</span>
</button>
<div>
<h1 class="font-bold text-lg leading-none text-gray-900">SafeRoute</h1>
<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Driver Management</p>
</div>
</div>
<button class="relative p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
</button>
</header>
<main class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-6 bg-gray-50">
<div class="space-y-4">
<div class="flex justify-between items-end">
<h2 class="text-2xl font-bold text-gray-900">Registered Drivers</h2>
<span class="text-sm font-medium text-gray-500">Total: 12</span>
</div>
<button class="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3.5 rounded-xl shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
<span class="material-symbols-outlined">person_add</span>
                    Add New Driver
                </button>
<div class="relative">
<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">search</span>
<input class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none shadow-sm placeholder-gray-400" placeholder="Search by name or ID..." type="text"/>
</div>
</div>
<div class="space-y-3">
<div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-full bg-gray-100 border border-gray-100 overflow-hidden shrink-0">
<img alt="Driver" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS5UGl6lRIZP6GOSsRYV4Bf55yQJI7ctuTq7noJJ9QWF8lcanUJWQmotb1P4fhhSikcTSO2WMDFCdVq2IOayaomXdJ1aVw8-YiTzX3Jl6-VP6fHkmevz55ykMKzxGwEeXtheyC-3GN4a5axJD1pqJM2n2XdlXhsUH9wTH0SqSasNQxyJgTUhAfPHc4pZ_pQo3s-sD31HaSieqjgJ26SkDeyk7BrCvdiKh4ZRDfdjowhKbXIR4tt3SoyxW9IhdERtIycghK4pLaPNc"/>
</div>
<div>
<h3 class="text-sm font-bold text-gray-900">Sadaat Malik</h3>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100 font-medium">Active</span>
<span class="text-xs text-gray-500">ID: #DRV-001</span>
</div>
</div>
</div>
<button class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition-colors">
                        View Details
                    </button>
</div>
<div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-full bg-gray-100 border border-gray-100 overflow-hidden shrink-0">
<img alt="Driver" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZ4Un15XQkxv117-kv3N11vAhyxyXv7sP1VUCW7RGA1u5bolOBBNGe839sbH4Gv8Lqx1BDt-Lx2M51E5evJ-ovdBccj4wDDurkPi7FZsXHzyh4WKXcLR8d-kjzRIFsgVbdDg8GKALBclZ-ASBSHTkDveovrG4Y535XTYVpfvOjIsNi0MFu54w7LflbE3k3a9zwBDJPITQm-9OAVCmU2l94z-0nPmYtV2oK0DJI2adnRTqlLlmYd5OZHrBjvFK8e0W3MYtZrKn-ouc"/>
</div>
<div>
<h3 class="text-sm font-bold text-gray-900">Ali Raza</h3>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 font-medium">Off Duty</span>
<span class="text-xs text-gray-500">ID: #DRV-004</span>
</div>
</div>
</div>
<button class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition-colors">
                        View Details
                    </button>
</div>
<div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-full bg-gray-100 border border-gray-100 overflow-hidden shrink-0">
<img alt="Driver" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-JaQJqijabb5DV2bWadAVfxOWiR8a-MYr9Zkx7iu01w6qgYxYi2JelSKSQz5QvsJelQbtwII1c-BGgt0N_Eb1Qoo98bmn2tZ1Wve6etNFgPHE5ZHvfNGSHRRKNpvuVRX-whqlygSYXQ2IYMrtQwYjf5hXuAcTNfi7oU1JFGIOUWgzfHVVnlqg_kyCxZwSed4oG2wkhJ3Ks8uZtsf9yurN6rLB3lIK5IEmP0m5LJlLi5wZiJvfbcWza5HK2RZ1rSNTAWyCuSAtwNI"/>
</div>
<div>
<h3 class="text-sm font-bold text-gray-900">Sana Javed</h3>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100 font-medium">Active</span>
<span class="text-xs text-gray-500">ID: #DRV-009</span>
</div>
</div>
</div>
<button class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition-colors">
                        View Details
                    </button>
</div>
<div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between opacity-75">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-full bg-gray-100 border border-gray-100 overflow-hidden shrink-0 grayscale">
<img alt="Driver" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm8E1lpcKEntaB2aN_OkdJsBX77GChHXvcZKCy9hXEiDmjnf8sq3E0cw6TU80L_n_6ayGhuz7j6vmYUcNMas1fLnG73zmIy6w6es77vrGODPZDcqRJP-06LI_kuYLVo1OmVBQzl_I_GMkR0QlNOLVQYube04qxeV7mG1UUExZTs5McdCVZFIcCdkiqT_JnqKyNWO84K-PCgXAcVmZXBHKhq-Lx0NuGFwu2xrtHtEEopjViRUvz9IHb1R1RyoB86P50Srcjix0YCdY"/>
</div>
<div>
<h3 class="text-sm font-bold text-gray-900">Usman Tariq</h3>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 font-medium">Suspended</span>
<span class="text-xs text-gray-500">ID: #DRV-012</span>
</div>
</div>
</div>
<button class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition-colors">
                        View Details
                    </button>
</div>
<div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-full bg-gray-100 border border-gray-100 overflow-hidden shrink-0">
<img alt="Driver" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATogHE0l_QJOEWDDgqDeQzin-b9C7jMWv8L9HgWe03uJgZtHEZsf6S9x6CG6x3tJNnrZZ9j21rMlw3d0QsL_quzSTzAmzVAd_ZxWQ7TRzRHjhrilVgZOqD_mcdpY_KXVPwm1kK_XOMsJl-bhFQtfxzGeDS_KsoH9QsX_DU1DpM7XhKZnb2xTZk8jtNhMFi2aZXIXd2w0Tn-3BjbJnKs9I3e18PhWxynrbEU07-8zrnQlD4LcDWBwLt29RXWsPP6B1Yt6y1mo2eKSg"/>
</div>
<div>
<h3 class="text-sm font-bold text-gray-900">Hina Noor</h3>
<div class="flex items-center gap-1.5 mt-0.5">
<span class="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100 font-medium">Active</span>
<span class="text-xs text-gray-500">ID: #DRV-015</span>
</div>
</div>
</div>
<button class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition-colors">
                        View Details
                    </button>
</div>
</div>
<p class="text-center text-xs text-gray-400 pt-2 pb-4">End of list</p>
</main>
<nav class="bg-white border-t border-gray-100 flex justify-between items-start px-2 py-3 pb-8 z-50 w-full shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">home</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Home</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">upload_file</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Upload<br/>Schedule</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">person_add</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Reg.<br/>Student</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group w-16" href="#">
<span class="material-symbols-outlined text-yellow-500 text-[26px]" style="font-variation-settings: 'FILL' 1;">badge</span>
<span class="text-[10px] font-bold text-yellow-600 leading-none text-center mt-0.5">Reg.<br/>Driver</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">campaign</span>
<span class="text-[10px] font-medium leading-none mt-0.5 group-hover:text-gray-600 text-center text-[9px]">Announcements</span>
</a>
</nav>
</div>
</body></html>

<!-- Admin Dashboard Home, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Bus List &amp; Management - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            yellow: '#F59E0B', 
                            dark: '#111827',
                            gray: '#F3F4F6',
                        }
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 h-screen w-full flex justify-center items-center overflow-hidden">
<div class="w-full h-full max-w-md bg-gray-50 relative flex flex-col shadow-2xl overflow-hidden">
<div class="bg-white w-full h-12 flex justify-between items-end px-6 pb-2 text-xs font-medium text-gray-900 z-50">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
<div class="flex items-center gap-4">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-600 transition-colors group">
<span class="material-symbols-outlined text-2xl group-hover:text-yellow-600">menu</span>
</button>
<div>
<h1 class="font-bold text-lg leading-none text-gray-900">SafeRoute</h1>
<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Admin Portal</p>
</div>
</div>
<button class="relative p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full border border-white"></span>
</button>
</header>
<main class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-6 bg-gray-50">
<div class="flex flex-col gap-5">
<div class="flex justify-between items-end">
<div>
<h2 class="text-2xl font-bold text-gray-900">Bus Management</h2>
<p class="text-sm text-gray-500 mt-1">Manage registration &amp; details</p>
</div>
<div class="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm">
<span class="text-xs font-bold text-gray-600">Total: 24</span>
</div>
</div>
<button class="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 transition-all group">
<span class="material-symbols-outlined group-hover:rotate-90 transition-transform">add_circle</span>
                Add New Bus
            </button>
</div>
<div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
<button class="px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-full whitespace-nowrap">All Buses</button>
<button class="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full whitespace-nowrap hover:bg-gray-50">Active</button>
<button class="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full whitespace-nowrap hover:bg-gray-50">Maintenance</button>
</div>
<div class="space-y-4">
<div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 group hover:border-yellow-300 transition-colors">
<div class="flex justify-between items-start">
<div class="flex gap-4">
<div class="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 group-hover:bg-yellow-100 transition-colors">
<span class="material-symbols-outlined">directions_bus</span>
</div>
<div>
<h3 class="font-bold text-gray-900 text-lg">Bus #101</h3>
<p class="text-xs text-gray-500 font-mono mt-0.5">KA-05-AB-1234</p>
</div>
</div>
<div class="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wide rounded-md border border-green-100">
                        Active
                    </div>
</div>
<div class="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl">
<div>
<span class="block text-[10px] uppercase text-gray-400 font-bold">Capacity</span>
<span class="text-sm font-semibold text-gray-700">42 Seats</span>
</div>
<div>
<span class="block text-[10px] uppercase text-gray-400 font-bold">Driver</span>
<span class="text-sm font-semibold text-gray-700">Ramesh K.</span>
</div>
</div>
<button class="w-full bg-white border border-gray-200 text-gray-900 font-semibold text-sm py-2.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2 group-hover:border-gray-300">
<span class="material-symbols-outlined text-[18px]">edit_square</span>
                    Update
                </button>
</div>
<div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 group hover:border-yellow-300 transition-colors">
<div class="flex justify-between items-start">
<div class="flex gap-4">
<div class="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
<span class="material-symbols-outlined">directions_bus</span>
</div>
<div>
<h3 class="font-bold text-gray-900 text-lg">Bus #104</h3>
<p class="text-xs text-gray-500 font-mono mt-0.5">KA-05-CJ-9982</p>
</div>
</div>
<div class="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wide rounded-md border border-gray-200">
                        Maintenance
                    </div>
</div>
<div class="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl">
<div>
<span class="block text-[10px] uppercase text-gray-400 font-bold">Capacity</span>
<span class="text-sm font-semibold text-gray-700">32 Seats</span>
</div>
<div>
<span class="block text-[10px] uppercase text-gray-400 font-bold">Driver</span>
<span class="text-sm font-semibold text-gray-400 italic">Unassigned</span>
</div>
</div>
<button class="w-full bg-white border border-gray-200 text-gray-900 font-semibold text-sm py-2.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2 group-hover:border-gray-300">
<span class="material-symbols-outlined text-[18px]">edit_square</span>
                    Update
                </button>
</div>
<div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 group hover:border-yellow-300 transition-colors">
<div class="flex justify-between items-start">
<div class="flex gap-4">
<div class="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 group-hover:bg-yellow-100 transition-colors">
<span class="material-symbols-outlined">directions_bus</span>
</div>
<div>
<h3 class="font-bold text-gray-900 text-lg">Bus #105</h3>
<p class="text-xs text-gray-500 font-mono mt-0.5">KA-05-XY-4567</p>
</div>
</div>
<div class="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wide rounded-md border border-green-100">
                        Active
                    </div>
</div>
<div class="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl">
<div>
<span class="block text-[10px] uppercase text-gray-400 font-bold">Capacity</span>
<span class="text-sm font-semibold text-gray-700">50 Seats</span>
</div>
<div>
<span class="block text-[10px] uppercase text-gray-400 font-bold">Driver</span>
<span class="text-sm font-semibold text-gray-700">Suresh M.</span>
</div>
</div>
<button class="w-full bg-white border border-gray-200 text-gray-900 font-semibold text-sm py-2.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2 group-hover:border-gray-300">
<span class="material-symbols-outlined text-[18px]">edit_square</span>
                    Update
                </button>
</div>
</div>
</main>
<nav class="bg-white border-t border-gray-100 flex justify-between items-start px-2 py-3 pb-8 z-50 w-full shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
<a class="flex-1 flex flex-col items-center gap-1 group w-16 text-gray-400 hover:text-yellow-600 transition-colors" href="#">
<span class="material-symbols-outlined text-[26px]">home</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5">Home</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">upload_file</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Upload<br/>Schedule</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">person_add</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Reg.<br/>Student</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">badge</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Reg.<br/>Driver</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">campaign</span>
<span class="text-[10px] font-medium leading-none mt-0.5 group-hover:text-gray-600 text-center">Announcements</span>
</a>
</nav>
</div>

</body></html>

<!-- Admin Register Student -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Register Student - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                        "text-main": "#1c190d",
                        "text-muted": "#9c8e49",
                        "border-color": "#e8e4ce"
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>.no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-main antialiased selection:bg-primary/30">
<div class="relative mx-auto flex h-full min-h-screen w-full max-w-[480px] flex-col overflow-hidden bg-white dark:bg-neutral-900 shadow-xl">
<header class="sticky top-0 z-10 flex items-center justify-between bg-white/90 px-4 py-3 backdrop-blur-md dark:bg-neutral-900/90 dark:text-white border-b border-border-color dark:border-neutral-800">
<button class="flex size-10 items-center justify-center rounded-full text-text-main hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 transition-colors">
<span class="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
</button>
<h1 class="text-lg font-bold leading-tight tracking-tight text-text-main dark:text-white">Register Student</h1>
<div class="size-10"></div> 
</header>
<div class="flex w-full flex-col items-center justify-center gap-2 bg-white px-6 py-4 dark:bg-neutral-900">
<div class="flex w-full items-center justify-between px-2">
<span class="text-xs font-semibold uppercase tracking-wider text-primary">Step 1: Details</span>
<span class="text-xs font-medium text-text-muted dark:text-neutral-500">Step 2: Photo ID</span>
</div>
<div class="relative h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
<div class="absolute left-0 top-0 h-full w-1/2 rounded-full bg-primary transition-all duration-300"></div>
</div>
</div>
<main class="flex-1 overflow-y-auto no-scrollbar pb-28">
<section class="mt-2">
<div class="px-4 py-3">
<h3 class="text-lg font-bold leading-tight text-text-main dark:text-white">Basic Information</h3>
</div>
<div class="flex flex-col gap-5 px-4 pb-4">
<label class="flex flex-col gap-1.5">
<span class="text-sm font-medium text-text-main dark:text-neutral-200">Full Name</span>
<input class="form-input h-12 w-full rounded-lg border border-border-color bg-background-light px-4 text-base text-text-main placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-primary" placeholder="Enter student's full name" type="text"/>
</label>
<div class="flex gap-4">
<label class="flex flex-1 flex-col gap-1.5">
<span class="text-sm font-medium text-text-main dark:text-neutral-200">Student ID</span>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">badge</span>
<input class="form-input h-12 w-full rounded-lg border border-border-color bg-background-light pl-10 pr-4 text-base text-text-main placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-primary" placeholder="Ex: 2023001" type="text"/>
</div>
</label>
<label class="flex flex-1 flex-col gap-1.5">
<span class="text-sm font-medium text-text-main dark:text-neutral-200">Roll Number</span>
<input class="form-input h-12 w-full rounded-lg border border-border-color bg-background-light px-4 text-base text-text-main placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-primary" placeholder="Ex: 15" type="number"/>
</label>
</div>
<label class="flex flex-col gap-1.5">
<span class="text-sm font-medium text-text-main dark:text-neutral-200">Email Address</span>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">mail</span>
<input class="form-input h-12 w-full rounded-lg border border-border-color bg-background-light pl-10 pr-4 text-base text-text-main placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-primary" placeholder="student@university.edu" type="email"/>
</div>
</label>
<label class="flex flex-col gap-1.5">
<span class="text-sm font-medium text-text-main dark:text-neutral-200">Phone Number</span>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">call</span>
<input class="form-input h-12 w-full rounded-lg border border-border-color bg-background-light pl-10 pr-4 text-base text-text-main placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-primary" placeholder="(555) 000-0000" type="tel"/>
</div>
</label>
</div>
</section>
<div class="h-2 w-full bg-background-light dark:bg-black/20"></div>
<section class="mt-4">
<div class="px-4 py-3">
<h3 class="text-lg font-bold leading-tight text-text-main dark:text-white">Parent/Guardian Information</h3>
</div>
<div class="flex flex-col gap-5 px-4 pb-4">
<label class="flex flex-col gap-1.5">
<span class="text-sm font-medium text-text-main dark:text-neutral-200">Parent Full Name</span>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">person</span>
<input class="form-input h-12 w-full rounded-lg border border-border-color bg-background-light pl-10 pr-4 text-base text-text-main placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-primary" placeholder="Enter parent's full name" type="text"/>
</div>
</label>
<label class="flex flex-col gap-1.5">
<span class="text-sm font-medium text-text-main dark:text-neutral-200">Parent Email Address</span>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">mail</span>
<input class="form-input h-12 w-full rounded-lg border border-border-color bg-background-light pl-10 pr-4 text-base text-text-main placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-primary" placeholder="parent@example.com" type="email"/>
</div>
</label>
<div class="mt-1 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 dark:border-primary/30 dark:bg-primary/10">
<div class="flex h-6 items-center">
<input class="size-5 rounded border-gray-300 text-primary focus:ring-primary dark:border-neutral-600 dark:bg-neutral-700 dark:focus:ring-offset-neutral-900" id="send-login" type="checkbox"/>
</div>
<div class="text-sm">
<label class="font-medium text-text-main dark:text-white" for="send-login">Send Login ID &amp; Password</label>
<p class="text-xs text-text-muted dark:text-neutral-400">Credentials will be sent to the parent's email address upon registration.</p>
</div>
</div>
</div>
</section>
<div class="h-2 w-full bg-background-light dark:bg-black/20"></div>
<section class="mt-4">
<div class="px-4 py-3">
<h3 class="text-lg font-bold leading-tight text-text-main dark:text-white">Academic &amp; Transport</h3>
</div>
<div class="flex flex-col gap-5 px-4 pb-4">
<label class="flex flex-col gap-1.5">
<span class="text-sm font-medium text-text-main dark:text-neutral-200">Department</span>
<div class="relative">
<select class="form-select h-12 w-full appearance-none rounded-lg border border-border-color bg-background-light px-4 text-base text-text-main focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-primary">
<option disabled="" selected="" value="">Select Department</option>
<option value="cs">Computer Science</option>
<option value="eng">Engineering</option>
<option value="arts">Arts &amp; Humanities</option>
<option value="bus">Business Administration</option>
</select>
<span class="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-[24px]">expand_more</span>
</div>
</label>
<label class="flex flex-col gap-1.5">
<span class="text-sm font-medium text-text-main dark:text-neutral-200">Assigned Bus Route</span>
<div class="relative">
<select class="form-select h-12 w-full appearance-none rounded-lg border border-border-color bg-background-light px-4 text-base text-text-main focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-primary">
<option disabled="" selected="" value="">Select Route</option>
<option value="r1">Route A - North Campus</option>
<option value="r2">Route B - Downtown</option>
<option value="r3">Route C - West Side</option>
</select>
<span class="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-[24px]">directions_bus</span>
</div>
</label>
</div>
</section>
<div class="h-2 w-full bg-background-light dark:bg-black/20"></div>
<section class="mt-4 pb-6">
<div class="px-4 py-3">
<h3 class="text-lg font-bold leading-tight text-text-main dark:text-white">Student Photo</h3>
<p class="mt-1 text-sm text-text-muted dark:text-neutral-400">Please upload a clear passport-sized photo for the ID card.</p>
</div>
<div class="mx-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-color bg-background-light py-8 transition-colors hover:border-primary/50 hover:bg-white dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-primary/50 dark:hover:bg-neutral-800">
<div class="mb-3 flex size-16 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-700">
<span class="material-symbols-outlined text-primary text-[32px]">add_a_photo</span>
</div>
<span class="text-sm font-semibold text-text-main dark:text-white">Tap to upload photo</span>
<span class="mt-1 text-xs text-text-muted dark:text-neutral-500">JPG, PNG up to 5MB</span>
</div>
</section>
</main>
<footer class="absolute bottom-0 z-20 w-full border-t border-border-color bg-white px-4 py-4 pb-6 dark:border-neutral-800 dark:bg-neutral-900">
<div class="flex gap-3">
<button class="flex h-12 flex-1 items-center justify-center rounded-lg border border-border-color bg-white text-base font-semibold text-text-main transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700">
                    Cancel
                </button>
<button class="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-base font-bold text-neutral-900 shadow-sm transition-transform active:scale-[0.98]">
                    Next Step
                    <span class="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
</button>
</div>
</footer>
</div>

</body></html>

<!-- Admin Dashboard Home, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Register New Bus - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            yellow: '#F59E0B', 
                            dark: '#111827',
                            gray: '#F3F4F6',
                        }
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 h-screen w-full flex justify-center items-center overflow-hidden">
<div class="w-full h-full max-w-md bg-gray-50 relative flex flex-col shadow-2xl overflow-hidden">
<div class="bg-white w-full h-12 flex justify-between items-end px-6 pb-2 text-xs font-medium text-gray-900 z-50">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
<div class="flex items-center gap-4">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-600 transition-colors group">
<span class="material-symbols-outlined text-2xl group-hover:text-yellow-600">menu</span>
</button>
<div>
<h1 class="font-bold text-lg leading-none text-gray-900">SafeRoute</h1>
<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Admin Portal</p>
</div>
</div>
<button class="relative p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full border border-white"></span>
</button>
</header>
<main class="flex-1 overflow-y-auto p-6 scroll-smooth pb-6 bg-gray-50">
<div class="flex flex-col gap-6">
<div class="flex justify-between items-end">
<div>
<h2 class="text-2xl font-bold text-gray-900">Register New Bus</h2>
<p class="text-sm text-gray-500 mt-1">Enter vehicle details below</p>
</div>
<div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
<span class="material-symbols-outlined">directions_bus</span>
</div>
</div>
<form class="space-y-5">
<div class="space-y-1.5">
<label class="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Bus Number</label>
<div class="relative group">
<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-gray-400 group-focus-within:text-yellow-500 transition-colors text-[20px]">tag</span>
</div>
<input class="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all text-sm font-medium" placeholder="e.g. 101" type="text"/>
</div>
</div>
<div class="space-y-1.5">
<label class="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Registration Plate</label>
<div class="relative group">
<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-gray-400 group-focus-within:text-yellow-500 transition-colors text-[20px]">call_to_action</span>
</div>
<input class="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all text-sm font-medium uppercase" placeholder="e.g. KA-05-AB-1234" type="text"/>
</div>
</div>
<div class="grid grid-cols-2 gap-4">
<div class="space-y-1.5">
<label class="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Capacity</label>
<div class="relative group">
<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-gray-400 group-focus-within:text-yellow-500 transition-colors text-[20px]">airline_seat_recline_normal</span>
</div>
<input class="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all text-sm font-medium" placeholder="40" type="number"/>
</div>
</div>
</div>
<div class="space-y-1.5">
<label class="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Assign Driver</label>
<div class="relative group">
<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-gray-400 group-focus-within:text-yellow-500 transition-colors text-[20px]">badge</span>
</div>
<select class="block w-full pl-10 pr-10 py-3 border-none rounded-xl bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all text-sm font-medium appearance-none cursor-pointer">
<option disabled="" selected="" value="">Select a driver</option>
<option value="ramesh">Ramesh K. (Available)</option>
<option value="suresh">Suresh M. (Available)</option>
<option value="john">John D. (On Leave)</option>
<option value="unassigned">-- Leave Unassigned --</option>
</select>
<div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-gray-400 text-[20px]">expand_more</span>
</div>
</div>
</div>
<div class="pt-4 space-y-3">
<button class="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 transition-all group" type="button">
<span class="material-symbols-outlined group-hover:scale-110 transition-transform">check_circle</span>
                            Register Bus
                        </button>
<button class="w-full bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 text-gray-500 font-bold py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all" type="button">
                            Cancel
                        </button>
</div>
</form>
</div>
</main>
<nav class="bg-white border-t border-gray-100 flex justify-between items-start px-2 py-3 pb-8 z-50 w-full shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
<a class="flex-1 flex flex-col items-center gap-1 group w-16 text-gray-400 hover:text-yellow-600 transition-colors" href="#">
<span class="material-symbols-outlined text-[26px]">home</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5">Home</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">upload_file</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Upload<br/>Schedule</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">person_add</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Reg.<br/>Student</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">badge</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Reg.<br/>Driver</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">campaign</span>
<span class="text-[10px] font-medium leading-none mt-0.5 group-hover:text-gray-600 text-center">Announcements</span>
</a>
</nav>
</div>

</body></html>

<!-- Admin Dashboard Home, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Dashboard - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            yellow: '#F59E0B',
                            dark: '#111827',
                            gray: '#F3F4F6',
                        }
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 h-screen w-full flex justify-center items-center overflow-hidden">
<div class="w-full h-full max-w-md bg-gray-50 relative flex flex-col shadow-2xl overflow-hidden">
<div class="bg-white w-full h-12 flex justify-between items-end px-6 pb-2 text-xs font-medium text-gray-900 z-50">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
<div class="flex items-center gap-4">
<button class="flex items-center gap-1.5 px-3 py-1.5 -ml-1 rounded-lg bg-gray-50 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 group border border-gray-100">
<span class="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-300">logout</span>
<span class="text-xs font-bold uppercase tracking-wide">Logout</span>
</button>
<div>
<h1 class="font-bold text-lg leading-none text-gray-900">SafeRoute</h1>
<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Admin Portal</p>
</div>
</div>
<button class="relative p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
<span class="material-symbols-outlined">reviews</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full border border-white"></span>
</button>
</header>
<main class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-6 bg-gray-50">
<div class="flex justify-between items-end">
<div>
<p class="text-sm text-gray-500">Good morning,</p>
<h2 class="text-2xl font-bold text-gray-900">Administrator</h2>
</div>
</div>
<section class="grid grid-cols-2 gap-4">
<div class="bg-yellow-400 p-5 rounded-2xl shadow-lg shadow-yellow-400/20 text-gray-900 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer">
<div class="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-300">
<span class="material-symbols-outlined text-9xl">directions_bus</span>
</div>
<div class="flex justify-between items-start z-10 relative">
<div class="bg-white/30 backdrop-blur-sm p-2 rounded-lg">
<span class="material-symbols-outlined text-gray-900">directions_bus</span>
</div>
<span class="material-symbols-outlined text-gray-800 opacity-50">arrow_outward</span>
</div>
<div class="z-10 relative">
<span class="block text-4xl font-extrabold tracking-tight">4</span>
<span class="text-xs font-bold opacity-80 uppercase tracking-wide mt-1">Active Buses</span>
</div>
</div>
<div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-gray-800 flex flex-col justify-between h-40 group hover:border-yellow-400 transition-colors cursor-pointer">
<div class="flex justify-between items-start">
<div class="bg-gray-100 p-2 rounded-lg text-gray-600 group-hover:bg-yellow-50 group-hover:text-yellow-600 transition-colors">
<span class="material-symbols-outlined">school</span>
</div>
</div>
<div>
<span class="block text-3xl font-bold text-gray-900">142</span>
<span class="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-1">Total Students</span>
</div>
</div>
</section>
<section>
<div class="flex items-center justify-between mb-3">
<h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Management</h3>
</div>
<div class="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
<button class="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-yellow-50/50 transition-colors group text-left">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-yellow-100 flex items-center justify-center text-gray-500 group-hover:text-yellow-700 transition-colors">
<span class="material-symbols-outlined">directions_bus</span>
</div>
<div>
<span class="block text-sm font-bold text-gray-900">Register Buses</span>
<span class="block text-xs text-gray-500">Add new vehicles to fleet</span>
</div>
</div>
<span class="material-symbols-outlined text-gray-300 group-hover:text-yellow-500 text-xl transition-colors">chevron_right</span>
</button>
<button class="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-yellow-50/50 transition-colors group text-left">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-yellow-100 flex items-center justify-center text-gray-500 group-hover:text-yellow-700 transition-colors">
<span class="material-symbols-outlined">campaign</span>
</div>
<div>
<span class="block text-sm font-bold text-gray-900">Announcements</span>
<span class="block text-xs text-gray-500">Push notifications to users</span>
</div>
</div>
<span class="material-symbols-outlined text-gray-300 group-hover:text-yellow-500 text-xl transition-colors">chevron_right</span>
</button>
</div>
</section>
<section>
<div class="bg-gray-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
<div class="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full -mr-10 -mt-10 opacity-50"></div>
<div class="relative z-10">
<div class="flex items-center justify-between mb-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-yellow-500">warning</span>
<h3 class="font-bold text-base">Recent Alert</h3>
</div>
<span class="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">10m ago</span>
</div>
<p class="text-sm text-gray-300 leading-relaxed mb-3">
<span class="font-semibold text-white">Bus #04</span> reported a delay of 15 mins due to heavy traffic on Route 7.
                        </p>
<button class="w-full bg-white text-gray-900 font-semibold text-sm py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                            View Details
                        </button>
</div>
</div>
</section>
</main>
<nav class="bg-white border-t border-gray-100 flex justify-between items-start px-2 py-3 pb-8 z-50 w-full shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
<a class="flex-1 flex flex-col items-center gap-1 group w-16" href="#">
<span class="material-symbols-outlined text-yellow-500 text-[26px]" style="font-variation-settings: 'FILL' 1;">home</span>
<span class="text-[10px] font-bold text-yellow-600">Home</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">upload_file</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Upload<br/>Schedule</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">person_add</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Reg.<br/>Student</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">badge</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Reg.<br/>Driver</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">campaign</span>
<span class="text-[10px] font-medium leading-none mt-0.5 group-hover:text-gray-600">Alerts</span>
</a>
</nav>
</div>

</body></html>

<!-- Admin Dashboard Home, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Update Bus - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            yellow: '#F59E0B', 
                            dark: '#111827',
                            gray: '#F3F4F6',
                        }
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 h-screen w-full flex justify-center items-center overflow-hidden">
<div class="w-full h-full max-w-md bg-gray-50 relative flex flex-col shadow-2xl overflow-hidden">
<div class="bg-white w-full h-12 flex justify-between items-end px-6 pb-2 text-xs font-medium text-gray-900 z-50">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
<div class="flex items-center gap-4">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-600 transition-colors group">
<span class="material-symbols-outlined text-2xl group-hover:text-yellow-600">arrow_back</span>
</button>
<div>
<h1 class="font-bold text-lg leading-none text-gray-900">Edit Bus Details</h1>
<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Admin Portal</p>
</div>
</div>
<button class="relative p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full border border-white"></span>
</button>
</header>
<main class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-6 bg-gray-50">
<div class="flex flex-col gap-6">
<div class="flex justify-between items-end">
<div>
<h2 class="text-2xl font-bold text-gray-900">Bus #101</h2>
<p class="text-sm text-gray-500 mt-1">Update information below</p>
</div>
<div class="bg-green-50 border border-green-100 px-3 py-1 rounded-lg">
<span class="text-xs font-bold text-green-700 uppercase tracking-wide">Active</span>
</div>
</div>
<form class="flex flex-col gap-5" onsubmit="event.preventDefault()">
<div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
<h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Vehicle Information</h3>
<div class="space-y-1.5">
<label class="text-sm font-semibold text-gray-700">Bus Number</label>
<div class="relative group">
<span class="absolute left-3 top-3.5 text-gray-400 material-symbols-outlined text-[20px] group-focus-within:text-yellow-500 transition-colors">directions_bus</span>
<input class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder-gray-400" type="text" value="101"/>
</div>
</div>
<div class="space-y-1.5">
<label class="text-sm font-semibold text-gray-700">Registration Number</label>
<div class="relative group">
<span class="absolute left-3 top-3.5 text-gray-400 material-symbols-outlined text-[20px] group-focus-within:text-yellow-500 transition-colors">pin</span>
<input class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder-gray-400 uppercase tracking-wide" type="text" value="KA-05-AB-1234"/>
</div>
</div>
<div class="space-y-1.5">
<label class="text-sm font-semibold text-gray-700">Capacity (Seats)</label>
<div class="relative group">
<span class="absolute left-3 top-3.5 text-gray-400 material-symbols-outlined text-[20px] group-focus-within:text-yellow-500 transition-colors">event_seat</span>
<input class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder-gray-400" type="number" value="42"/>
</div>
</div>
</div>
<div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
<h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Personnel</h3>
<div class="space-y-1.5">
<label class="text-sm font-semibold text-gray-700">Assigned Driver</label>
<div class="relative group">
<span class="absolute left-3 top-3.5 text-gray-400 material-symbols-outlined text-[20px] group-focus-within:text-yellow-500 transition-colors">badge</span>
<select class="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-gray-100">
<option selected="" value="ramesh">Ramesh K.</option>
<option value="suresh">Suresh M.</option>
<option value="rajesh">Rajesh P.</option>
<option class="text-gray-500" value="unassigned">Unassigned</option>
</select>
<span class="absolute right-3 top-3.5 text-gray-400 material-symbols-outlined pointer-events-none">expand_more</span>
</div>
<p class="text-[10px] text-gray-400 mt-1 pl-1">Select a new driver to reassign automatically.</p>
</div>
</div>
<div class="pt-4 flex flex-col gap-3 pb-8">
<button class="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 transition-all group" type="button">
<span class="material-symbols-outlined group-hover:scale-110 transition-transform">save</span>
                    Save Changes
                </button>
<button class="w-full bg-white border border-red-100 text-red-600 hover:bg-red-50 active:scale-[0.98] font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all group" type="button">
<span class="material-symbols-outlined group-hover:scale-110 transition-transform">delete</span>
                    Delete Bus
                </button>
</div>
</form>
</div>
</main>
<nav class="bg-white border-t border-gray-100 flex justify-between items-start px-2 py-3 pb-8 z-50 w-full shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
<a class="flex-1 flex flex-col items-center gap-1 group w-16 text-gray-400 hover:text-yellow-600 transition-colors" href="#">
<span class="material-symbols-outlined text-[26px]">home</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5">Home</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">upload_file</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Upload<br/>Schedule</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">person_add</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Reg.<br/>Student</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">badge</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Reg.<br/>Driver</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">campaign</span>
<span class="text-[10px] font-medium leading-none mt-0.5 group-hover:text-gray-600 text-center">Announcements</span>
</a>
</nav>
</div>

</body></html>

<!-- Admin Driver View Details -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Driver View Details</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f9f506",
                        "background-light": "#f8f8f5",
                        "background-dark": "#23220f",
                        "card-light": "#ffffff",
                        "card-dark": "#2f2e1e",
                        "text-main": "#181811",
                        "text-secondary": "#8c8b5f",
                    },
                    fontFamily: {
                        "display": ["Manrope", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined.filled {
            font-variation-settings: 'FILL' 1;
        }.no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-gray-100 transition-colors duration-200">
<div class="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
<header class="flex items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark sticky top-0 z-10">
<button class="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-text-main dark:text-white" style="font-size: 24px;">arrow_back_ios_new</span>
</button>
<h1 class="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 text-text-main dark:text-white">Driver Details</h1>
</header>
<main class="flex-1 overflow-y-auto no-scrollbar pb-[100px]">
<div class="flex flex-col items-center px-6 pt-6 pb-6">
<h2 class="text-3xl font-extrabold text-text-main dark:text-white mb-2 text-center">Sadaat Malik</h2>
<div class="flex items-center gap-2 mb-2">
<span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wide rounded-full">On Route</span>
</div>
<p class="text-text-secondary dark:text-gray-400 text-sm font-medium">ID: DRV-2024-88</p>
</div>
<div class="px-4 space-y-5">
<section class="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
<div class="flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-primary filled">person</span>
<h3 class="text-base font-bold text-text-main dark:text-white">Personal Info</h3>
</div>
<div class="space-y-4">
<div class="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700/50">
<span class="text-sm text-text-secondary dark:text-gray-400">License No.</span>
<span class="text-sm font-semibold text-text-main dark:text-gray-100">DL-99887766</span>
</div>
<div class="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700/50">
<span class="text-sm text-text-secondary dark:text-gray-400">Date of Birth</span>
<span class="text-sm font-semibold text-text-main dark:text-gray-100">Jan 15, 1980</span>
</div>
<div class="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700/50">
<span class="text-sm text-text-secondary dark:text-gray-400">Phone</span>
<span class="text-sm font-semibold text-text-main dark:text-gray-100">+1 (555) 012-3456</span>
</div>
<div class="flex justify-between items-start">
<span class="text-sm text-text-secondary dark:text-gray-400">Address</span>
<span class="text-sm font-semibold text-text-main dark:text-gray-100 text-right max-w-[60%]">4521 Elm Street, Springfield, IL 62704</span>
</div>
</div>
</section>
<section class="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
<div class="flex items-center justify-between mb-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary filled">alt_route</span>
<h3 class="text-base font-bold text-text-main dark:text-white">Assigned Route</h3>
</div>
<button class="text-xs font-bold text-text-secondary dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">View Map</button>
</div>
<div class="flex items-center gap-4 bg-background-light dark:bg-black/20 p-3 rounded-xl mb-3">
<div class="size-12 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center shrink-0">
<img alt="School Bus" class="size-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMgZOSjEMTGISk9TTAJlNyw17o0T1Jm3gsVy3__6Q5GrlbLtyBdCtRQZBGzRvQvaC5JDrsYWja5xE024qtijBLNtZWT6KyxIAfnhef0FsMFamJPApfufQThJT7PDAptu96_3aNHqJ4mrHc7jibu9969dVCnk8-J6arG7LI9ogRCNLQtbqTX8RiQKoXi83pIY3hypcON41B6fy16YJ_ze_hzHJpr3OQ7eEL4-SLtrLTDduw13WDB7CVw73kqTBbNrQciOZHP3eepXE"/>
</div>
<div>
<p class="text-sm font-bold text-text-main dark:text-white">Bus #42 (Yellow Bird)</p>
<p class="text-xs text-text-secondary dark:text-gray-400">Capacity: 45 Students</p>
</div>
</div>
<div class="space-y-3">
<div class="flex justify-between items-center">
<span class="text-sm text-text-secondary dark:text-gray-400">Route Name</span>
<span class="text-sm font-semibold text-text-main dark:text-gray-100">Route 5 - North Campus</span>
</div>
<div class="flex justify-between items-center">
<span class="text-sm text-text-secondary dark:text-gray-400">Shift</span>
<span class="text-sm font-semibold text-text-main dark:text-gray-100">Morning &amp; Evening</span>
</div>
</div>
</section>
<section class="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
<div class="flex items-center gap-2 mb-4">
<span class="material-symbols-outlined text-primary filled">history_edu</span>
<h3 class="text-base font-bold text-text-main dark:text-white">Employment</h3>
</div>
<div class="space-y-3">
<div class="flex justify-between items-center">
<span class="text-sm text-text-secondary dark:text-gray-400">Date Joined</span>
<span class="text-sm font-semibold text-text-main dark:text-gray-100">Aug 15, 2021</span>
</div>
<div class="flex justify-between items-center">
<span class="text-sm text-text-secondary dark:text-gray-400">Experience</span>
<span class="text-sm font-semibold text-text-main dark:text-gray-100">5 Years</span>
</div>
<div class="flex justify-between items-center">
<span class="text-sm text-text-secondary dark:text-gray-400">Contract Type</span>
<span class="text-sm font-semibold text-text-main dark:text-gray-100">Full Time</span>
</div>
</div>
</section>
<div class="flex flex-col gap-3 pt-2 pb-6">
<button class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary h-12 px-5 text-black text-base font-bold leading-normal hover:opacity-90 transition-opacity">
<span class="material-symbols-outlined">edit</span>
                        Edit Driver
                    </button>
<button class="flex w-full items-center justify-center gap-2 rounded-xl h-12 px-5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 text-base font-bold leading-normal hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
<span class="material-symbols-outlined">delete</span>
                        Delete Driver
                    </button>
</div>
</div>
</main>
<nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card-light dark:bg-card-dark border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-2 z-50">
<div class="flex justify-between items-center h-16 px-2">
<button class="flex flex-1 flex-col items-center justify-center gap-1 group">
<span class="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-2xl">home</span>
<span class="text-[10px] font-medium text-gray-400 group-hover:text-text-main dark:group-hover:text-white transition-colors">Home</span>
</button>
<button class="flex flex-1 flex-col items-center justify-center gap-1 group">
<span class="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-2xl">calendar_month</span>
<span class="text-[10px] font-medium text-gray-400 group-hover:text-text-main dark:group-hover:text-white transition-colors">Schedule</span>
</button>
<button class="flex flex-1 flex-col items-center justify-center gap-1 group">
<span class="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-2xl">school</span>
<span class="text-[10px] font-medium text-gray-400 group-hover:text-text-main dark:group-hover:text-white transition-colors">Students</span>
</button>
<button class="flex flex-1 flex-col items-center justify-center gap-1 group">
<div class="bg-primary/20 dark:bg-primary/30 p-1.5 rounded-xl">
<span class="material-symbols-outlined text-black dark:text-white text-2xl">person_add</span>
</div>
<span class="text-[10px] font-bold text-text-main dark:text-white">Drivers</span>
</button>
<button class="flex flex-1 flex-col items-center justify-center gap-1 group">
<span class="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-2xl">campaign</span>
<span class="text-[10px] font-medium text-gray-400 group-hover:text-text-main dark:group-hover:text-white transition-colors">Alerts</span>
</button>
</div>
</nav>
</div>
</body></html>

<!-- Admin Dashboard Home, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Student View Details - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            yellow: '#F59E0B', 
                            dark: '#111827',
                            gray: '#F3F4F6',
                        }
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 h-screen w-full flex justify-center items-center overflow-hidden">
<div class="w-full h-full max-w-md bg-gray-50 relative flex flex-col shadow-2xl overflow-hidden">
<div class="bg-white w-full h-12 flex justify-between items-end px-6 pb-2 text-xs font-medium text-gray-900 z-50">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-600 transition-colors group">
<span class="material-symbols-outlined text-2xl group-hover:text-gray-900">arrow_back</span>
</button>
<div>
<h1 class="font-bold text-lg leading-none text-gray-900 text-center">Student Details</h1>
</div>
<button class="relative p-2 -mr-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</header>
<main class="flex-1 overflow-y-auto scroll-smooth bg-gray-50 pb-6">
<div class="bg-white pb-8 pt-6 px-6 rounded-b-3xl shadow-sm border-b border-gray-100 flex flex-col items-center text-center relative z-10">
<div class="relative mb-4">
<div class="w-28 h-28 rounded-full bg-gray-100 p-1 border-2 border-yellow-400 shadow-md">
<img alt="Student" class="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtAApRBE9tcB_hGJyevTPe-NzUnY86qhRaDsr1p4FP6uSnUQ64Mjv-UjXWJwMVTpqPwdxz1ZRX66MST-iHXWeZrL8InIN5qP77wYAoMEBKxl6NbABIx_NlNsRv_zMnhBqJotoTvh_95e0wFUYyaYUKsC98RHzfikQYfn7PvUTOi1t0k1-_t5XNlzm2ekRF0X_Ef8WDzaTkrKBsLaFr7yRZjLCTsYHyBVtzWGA9X_bjRqJwguDfIUUjO_ME680TTFg1_69Ew4Z479Q"/>
</div>
<div class="absolute bottom-1 right-1 bg-green-500 border-[3px] border-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-white text-[14px] font-bold">check</span>
</div>
</div>
<h2 class="text-xl font-bold text-gray-900">Ayesha Khan</h2>
<p class="text-sm text-gray-500 mt-1 font-medium">Computer Science Dept.</p>
<div class="mt-5 flex items-center gap-3">
<span class="px-4 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200 shadow-sm">
                    Route 4A
                </span>
<span class="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                    ID: 2024-001
                </span>
</div>
</div>
<div class="p-6 space-y-6">
<section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
<h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
<span class="material-symbols-outlined text-yellow-500 text-lg">school</span>
                    Academic Info
                </h3>
<div class="space-y-0 divide-y divide-gray-50">
<div class="flex justify-between items-center py-3">
<span class="text-sm text-gray-500">Academic Year</span>
<span class="text-sm font-semibold text-gray-900">3rd Year (Junior)</span>
</div>
<div class="flex justify-between items-center py-3">
<span class="text-sm text-gray-500">Semester</span>
<span class="text-sm font-semibold text-gray-900">Fall 2024</span>
</div>
<div class="flex justify-between items-center py-3">
<span class="text-sm text-gray-500">Roll Number</span>
<span class="text-sm font-semibold text-gray-900">CS-21-045</span>
</div>
</div>
</section>
<section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
<h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
<span class="material-symbols-outlined text-yellow-500 text-lg">directions_bus</span>
                    Route Details
                </h3>
<div class="space-y-0 divide-y divide-gray-50">
<div class="flex justify-between items-center py-3">
<span class="text-sm text-gray-500">Assigned Route</span>
<span class="text-sm font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">Route 4A</span>
</div>
<div class="flex justify-between items-center py-3">
<span class="text-sm text-gray-500">Pickup Point</span>
<span class="text-sm font-semibold text-gray-900">Gulberg Main Stop</span>
</div>
<div class="flex justify-between items-center py-3">
<span class="text-sm text-gray-500">Bus Number</span>
<span class="text-sm font-semibold text-gray-900">LEV-892</span>
</div>
</div>
</section>
<section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
<h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
<span class="material-symbols-outlined text-yellow-500 text-lg">contact_phone</span>
                    Contact Details
                </h3>
<div class="space-y-4">
<div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors -mx-2">
<div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 shrink-0">
<span class="material-symbols-outlined text-sm">call</span>
</div>
<div class="flex-1">
<p class="text-xs text-gray-500">Phone Number</p>
<p class="text-sm font-medium text-gray-900">+92 300 1234567</p>
</div>
<button class="text-gray-300 hover:text-blue-500 transition-colors">
<span class="material-symbols-outlined text-lg">chat</span>
</button>
</div>
<div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors -mx-2">
<div class="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100 shrink-0">
<span class="material-symbols-outlined text-sm">mail</span>
</div>
<div class="flex-1">
<p class="text-xs text-gray-500">Email Address</p>
<p class="text-sm font-medium text-gray-900 break-all">ayesha.k@uni.edu.pk</p>
</div>
</div>
<div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors -mx-2">
<div class="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 border border-purple-100 shrink-0">
<span class="material-symbols-outlined text-sm">diversity_3</span>
</div>
<div class="flex-1">
<p class="text-xs text-gray-500">Guardian Contact</p>
<p class="text-sm font-medium text-gray-900">Mr. Khan (+92 321 7654321)</p>
</div>
</div>
</div>
</section>
<div class="grid grid-cols-2 gap-3 pt-2">
<button class="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-[0.98]">
<span class="material-symbols-outlined text-[20px]">edit_square</span>
                    Edit Student
                </button>
<button class="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-red-50 text-red-600 font-bold text-sm border border-red-100 hover:bg-red-100 transition-all shadow-sm active:scale-[0.98]">
<span class="material-symbols-outlined text-[20px]">delete</span>
                    Delete Student
                </button>
</div>
</div>
</main>
<nav class="bg-white border-t border-gray-100 flex justify-between items-start px-2 py-3 pb-8 z-50 w-full shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
<a class="flex-1 flex flex-col items-center gap-1 group w-16 text-gray-400 hover:text-yellow-600 transition-colors" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">home</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Home</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">upload_file</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Upload<br/>Schedule</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group w-16" href="#">
<span class="material-symbols-outlined text-yellow-500 text-[26px]" style="font-variation-settings: 'FILL' 1;">person_add</span>
<span class="text-[10px] font-bold text-yellow-600 text-center mt-0.5">Reg.<br/>Student</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">badge</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Reg.<br/>Driver</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">campaign</span>
<span class="text-[10px] font-medium leading-none mt-0.5 group-hover:text-gray-600">Announcements</span>
</a>
</nav>
</div>

</body></html>

<!-- Admin Dashboard Home, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Student Management - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            yellow: '#F59E0B', 
                            dark: '#111827',
                            gray: '#F3F4F6',
                        }
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 h-screen w-full flex justify-center items-center overflow-hidden">
<div class="w-full h-full max-w-md bg-gray-50 relative flex flex-col shadow-2xl overflow-hidden">
<div class="bg-white w-full h-12 flex justify-between items-end px-6 pb-2 text-xs font-medium text-gray-900 z-50">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
<div class="flex items-center gap-4">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-600 transition-colors group">
<span class="material-symbols-outlined text-2xl group-hover:text-yellow-600">menu</span>
</button>
<div>
<h1 class="font-bold text-lg leading-none text-gray-900">Students</h1>
<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Management</p>
</div>
</div>
<button class="relative p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
<span class="material-symbols-outlined">search</span>
</button>
</header>
<main class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-6 bg-gray-50">
<section>
<button class="w-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 font-bold text-sm py-4 rounded-xl shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] group">
<span class="material-symbols-outlined transition-transform group-hover:rotate-90">add_circle</span>
                Add New Student
            </button>
</section>
<div class="flex items-center justify-between px-1">
<h2 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Registered Students <span class="text-gray-400 ml-1 font-normal">(142)</span></h2>
<button class="text-xs text-yellow-600 font-semibold flex items-center gap-1 hover:text-yellow-700">
                Filter <span class="material-symbols-outlined text-[16px]">filter_list</span>
</button>
</div>
<section class="space-y-3">
<div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-yellow-200 transition-colors">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100 overflow-hidden">
<img alt="Student" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtAApRBE9tcB_hGJyevTPe-NzUnY86qhRaDsr1p4FP6uSnUQ64Mjv-UjXWJwMVTpqPwdxz1ZRX66MST-iHXWeZrL8InIN5qP77wYAoMEBKxl6NbABIx_NlNsRv_zMnhBqJotoTvh_95e0wFUYyaYUKsC98RHzfikQYfn7PvUTOi1t0k1-_t5XNlzm2ekRF0X_Ef8WDzaTkrKBsLaFr7yRZjLCTsYHyBVtzWGA9X_bjRqJwguDfIUUjO_ME680TTFg1_69Ew4Z479Q"/>
</div>
<div>
<h3 class="font-bold text-gray-900 text-sm">Ayesha Khan</h3>
<div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
<span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">ID: 2024-001</span>
<span>• Route 4A</span>
</div>
</div>
</div>
<button class="px-3 py-1.5 rounded-lg border border-yellow-200 text-yellow-700 text-xs font-semibold hover:bg-yellow-50 active:bg-yellow-100 transition-colors whitespace-nowrap">
                    View Details
                </button>
</div>
<div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-yellow-200 transition-colors">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 font-bold text-sm">
                        BA
                    </div>
<div>
<h3 class="font-bold text-gray-900 text-sm">Bilal Ahmed</h3>
<div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
<span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">ID: 2024-042</span>
<span>• Route 2B</span>
</div>
</div>
</div>
<button class="px-3 py-1.5 rounded-lg border border-yellow-200 text-yellow-700 text-xs font-semibold hover:bg-yellow-50 active:bg-yellow-100 transition-colors whitespace-nowrap">
                    View Details
                </button>
</div>
<div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-yellow-200 transition-colors">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 border border-purple-100 font-bold text-sm">
                        FA
                    </div>
<div>
<h3 class="font-bold text-gray-900 text-sm">Fatima Ali</h3>
<div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
<span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">ID: 2024-118</span>
<span>• Route 1A</span>
</div>
</div>
</div>
<button class="px-3 py-1.5 rounded-lg border border-yellow-200 text-yellow-700 text-xs font-semibold hover:bg-yellow-50 active:bg-yellow-100 transition-colors whitespace-nowrap">
                    View Details
                </button>
</div>
<div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-yellow-200 transition-colors">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100 overflow-hidden">
<img alt="Student" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDL14Xz-tf4R4waeyLxckGAL23b2OA7g4l7hLR2_IT6sgsw2Al5PpTog2Il2J4WShaDugBS0zIore-9nSSIYGE9DQ3ij5F_h9KEUcqiqPpVJEszE_si1pNl8Z4gnX6U19YlK19fdVL8eWxfPMnq_IY6IkdNB2va1Z-auAllmP3WZ0C5pccNCmGfMMzSV_mv_6djN4PEu9Zp_WQqzEPfDuWs5fkVo1wKsJ3FY54g3LAuu8glghYME69z0Wb9xiRCicdPlp2-UGLjAU4"/>
</div>
<div>
<h3 class="font-bold text-gray-900 text-sm">Zeeshan Butt</h3>
<div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
<span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">ID: 2024-089</span>
<span>• Route 3C</span>
</div>
</div>
</div>
<button class="px-3 py-1.5 rounded-lg border border-yellow-200 text-yellow-700 text-xs font-semibold hover:bg-yellow-50 active:bg-yellow-100 transition-colors whitespace-nowrap">
                    View Details
                </button>
</div>
<div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-yellow-200 transition-colors">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100 font-bold text-sm">
                        SN
                    </div>
<div>
<h3 class="font-bold text-gray-900 text-sm">Sara Naveed</h3>
<div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
<span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">ID: 2024-201</span>
<span>• Route 4A</span>
</div>
</div>
</div>
<button class="px-3 py-1.5 rounded-lg border border-yellow-200 text-yellow-700 text-xs font-semibold hover:bg-yellow-50 active:bg-yellow-100 transition-colors whitespace-nowrap">
                    View Details
                </button>
</div>
<div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-yellow-200 transition-colors">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100 font-bold text-sm">
                        HS
                    </div>
<div>
<h3 class="font-bold text-gray-900 text-sm">Hamza Siddiqui</h3>
<div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
<span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">ID: 2024-055</span>
<span>• Route 1B</span>
</div>
</div>
</div>
<button class="px-3 py-1.5 rounded-lg border border-yellow-200 text-yellow-700 text-xs font-semibold hover:bg-yellow-50 active:bg-yellow-100 transition-colors whitespace-nowrap">
                    View Details
                </button>
</div>
</section>
</main>
<nav class="bg-white border-t border-gray-100 flex justify-between items-start px-2 py-3 pb-8 z-50 w-full shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
<a class="flex-1 flex flex-col items-center gap-1 group w-16 text-gray-400 hover:text-yellow-600 transition-colors" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">home</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Home</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">upload_file</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Upload<br/>Schedule</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group w-16" href="#">
<span class="material-symbols-outlined text-yellow-500 text-[26px]" style="font-variation-settings: 'FILL' 1;">person_add</span>
<span class="text-[10px] font-bold text-yellow-600 text-center mt-0.5">Reg.<br/>Student</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">badge</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Reg.<br/>Driver</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">campaign</span>
<span class="text-[10px] font-medium leading-none mt-0.5 group-hover:text-gray-600">Alerts</span>
</a>
</nav>
</div>

</body></html>

DRIVER SCREEN:
<!-- Driver Share Location -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Driver Profile Screen</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                    boxShadow: {
                        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
                        'floating': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                        'card': '0 4px 6px -1px rgb(0 0 0 / 0.02), 0 2px 4px -2px rgb(0 0 0 / 0.02)'
                    }
                },
            },
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-neutral-900 dark:text-neutral-100 antialiased overflow-x-hidden selection:bg-primary/30">
<div class="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
<header class="flex items-center p-6 pb-2 justify-between z-10">
<div class="flex flex-col flex-1">
<h2 class="text-neutral-900 dark:text-white text-3xl font-extrabold leading-tight tracking-tight">My Profile</h2>
</div>
<button class="flex h-10 items-center justify-center px-4 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 active:bg-neutral-100 dark:active:bg-neutral-700 transition-colors shadow-sm group">
<span class="material-symbols-outlined text-neutral-500 text-[18px] mr-1.5 group-active:text-red-500 transition-colors">logout</span>
<p class="text-neutral-600 dark:text-neutral-300 text-xs font-bold tracking-wide uppercase group-active:text-red-600 transition-colors">Logout</p>
</button>
</header>
<main class="flex-1 flex flex-col gap-6 px-4 py-4 overflow-y-auto pb-32">
<div class="flex flex-col items-center pt-4 pb-2">
<div class="relative mb-4">
<div class="w-28 h-28 rounded-full bg-neutral-200 overflow-hidden border-4 border-white dark:border-neutral-800 shadow-floating">
<img alt="Driver Profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwOEKQBTWBJknnI5pVE3BtnVoY1Dp_EPCpSn8hnWME4pWLEvuvfVCpZ5EMT1BXNv5tcP-94bT4rtt0Y9dzICq7GUPlofJCfRf8G6_k4irmqo97VUoQvwSt85VlPsYbTvUOh9MqLMpJjPxEvO6JRDV1uYwpPpfCTbQmbELsgfbW2e107-VzCcwiKGiQZYuj7begMSpcRlzskGunCABogsGAIi_gVxVh7B9NNxKddm-e9LrpoT15t6xvukeuKmBPzaJue-JSX1toUCg"/>
</div>
<div class="absolute bottom-1 right-1 bg-primary text-neutral-900 p-1.5 rounded-full border-2 border-white dark:border-neutral-800 shadow-sm">
<span class="material-symbols-outlined text-[16px] font-bold block">edit</span>
</div>
</div>
<h1 class="text-neutral-900 dark:text-white text-2xl font-extrabold tracking-tight">Sadaat Malik</h1>
<div class="flex items-center gap-2 mt-1">
<span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-neutral-900 text-primary">Active</span>
<p class="text-neutral-500 dark:text-neutral-400 text-sm font-bold">Bus Driver</p>
</div>
</div>
<div class="w-full bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-card border border-neutral-100 dark:border-neutral-700/50">
<h3 class="text-xs font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">Personal Information</h3>
<div class="space-y-5">
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-700 flex items-center justify-center">
<span class="material-symbols-outlined text-neutral-500 dark:text-neutral-400">badge</span>
</div>
<div class="flex flex-col">
<span class="text-xs text-neutral-400 font-medium">Employee ID</span>
<span class="text-base font-bold text-neutral-900 dark:text-white">#104</span>
</div>
</div>
</div>
<div class="w-full h-px bg-neutral-100 dark:bg-neutral-700/50"></div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-700 flex items-center justify-center">
<span class="material-symbols-outlined text-neutral-500 dark:text-neutral-400">call</span>
</div>
<div class="flex flex-col">
<span class="text-xs text-neutral-400 font-medium">Phone Number</span>
<span class="text-base font-bold text-neutral-900 dark:text-white">+1 (555) 012-3456</span>
</div>
</div>
</div>
<div class="w-full h-px bg-neutral-100 dark:bg-neutral-700/50"></div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-700 flex items-center justify-center">
<span class="material-symbols-outlined text-neutral-500 dark:text-neutral-400">drive_eta</span>
</div>
<div class="flex flex-col">
<span class="text-xs text-neutral-400 font-medium">License Number</span>
<span class="text-base font-bold text-neutral-900 dark:text-white">DL-9823-7721</span>
</div>
</div>
</div>
</div>
</div>
<div class="w-full bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-card border border-neutral-100 dark:border-neutral-700/50">
<h3 class="text-xs font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">Vehicle Assignment</h3>
<div class="space-y-5">
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
<span class="material-symbols-outlined text-primary/80">directions_bus</span>
</div>
<div class="flex flex-col">
<span class="text-xs text-neutral-400 font-medium">Bus Number</span>
<span class="text-base font-bold text-neutral-900 dark:text-white">Bus 104</span>
</div>
</div>
<span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">Assigned</span>
</div>
<div class="w-full h-px bg-neutral-100 dark:bg-neutral-700/50"></div>
<div class="grid grid-cols-2 gap-4">
<div class="flex flex-col">
<span class="text-xs text-neutral-400 font-medium mb-1">Plate Number</span>
<span class="text-lg font-bold text-neutral-900 dark:text-white font-mono tracking-tight">KPA-8829</span>
</div>
<div class="flex flex-col">
<span class="text-xs text-neutral-400 font-medium mb-1">Model</span>
<span class="text-base font-bold text-neutral-900 dark:text-white">Volvo 9700</span>
</div>
</div>
</div>
</div>
<div class="w-full flex flex-col gap-3">
<button class="w-full py-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold flex items-center justify-center gap-2 active:bg-neutral-200 transition-colors">
<span class="material-symbols-outlined">settings</span>
            App Settings
          </button>
</div>
</main>
<nav class="bg-white dark:bg-[#1a1810] border-t border-neutral-200 dark:border-neutral-800 pb-safe z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
<div class="grid grid-cols-5 h-24">
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full group-hover:bg-neutral-100 dark:group-hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 text-[28px]">home</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 tracking-wide uppercase text-center leading-none">Home</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 relative bg-gradient-to-b from-primary/5 to-transparent">
<div class="absolute top-0 left-0 right-0 h-1 bg-primary mx-6 rounded-b-lg shadow-[0_2px_8px_rgba(242,204,13,0.4)]"></div>
<div class="p-1 rounded-full text-neutral-900 dark:text-white">
<span class="material-symbols-outlined text-primary text-[28px]">person</span>
</div>
<span class="text-[10px] font-extrabold text-neutral-900 dark:text-white tracking-wide uppercase">Profile</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full group-hover:bg-neutral-100 dark:group-hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 text-[28px]">qr_code_scanner</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 tracking-wide uppercase text-center leading-none">Scan<br/>Attendance</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full group-hover:bg-neutral-100 dark:group-hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 text-[28px]">report_problem</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 tracking-wide uppercase text-center leading-none">Report<br/>Issue</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full group-hover:bg-neutral-100 dark:group-hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 text-[28px]">directions_bus</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 tracking-wide uppercase text-center leading-none">Route<br/>&amp; Bus</span>
</button>
</div>
</nav>
</div>
</body></html>

<!-- Driver Share Location -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Driver Route &amp; Bus Assigned</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                    boxShadow: {
                        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
                        'floating': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    }
                },
            },
        }
    </script>
<style>
        body {
            min-height: max(884px, 100dvh);
        }.no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-neutral-900 dark:text-neutral-100 antialiased overflow-x-hidden selection:bg-primary/30">
<div class="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
<header class="flex items-center p-6 pb-2 justify-between z-10">
<div class="flex flex-col flex-1">
<h2 class="text-neutral-900 dark:text-white text-2xl font-extrabold leading-tight tracking-tight">Sadaat Malik</h2>
<div class="flex items-center gap-2 mt-0.5">
<span class="inline-block size-2 rounded-full bg-primary"></span>
<p class="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">Bus Driver #104</p>
</div>
</div>
<button class="flex h-10 items-center justify-center px-4 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 active:bg-neutral-100 dark:active:bg-neutral-700 transition-colors shadow-sm">
<p class="text-neutral-600 dark:text-neutral-300 text-xs font-bold tracking-wide uppercase">Logout</p>
</button>
</header>
<main class="flex-1 flex flex-col gap-6 px-4 py-2 overflow-hidden">
<div class="flex items-end justify-between pt-2">
<h1 class="text-neutral-900 dark:text-white text-2xl font-extrabold tracking-tight">Assigned Details</h1>
<span class="text-xs font-bold text-neutral-400 bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded">Oct 24, 2023</span>
</div>
<div class="w-full bg-white dark:bg-neutral-800 rounded-3xl p-5 shadow-lg border border-neutral-100 dark:border-neutral-700 relative overflow-hidden group">
<div class="absolute top-0 left-0 bottom-0 w-2 bg-primary"></div>
<div class="flex justify-between items-start pl-3">
<div>
<p class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Vehicle Details</p>
<div class="flex items-baseline gap-2">
<h2 class="text-4xl font-black text-neutral-900 dark:text-white tracking-tight">#104</h2>
<span class="text-sm font-bold text-neutral-500">Volvo 9700</span>
</div>
<div class="flex gap-4 mt-3">
<div class="bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-100 dark:border-neutral-700">
<p class="text-[10px] font-bold text-neutral-400 uppercase">License</p>
<p class="text-sm font-bold text-neutral-900 dark:text-white">KWY-882</p>
</div>
<div class="bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-100 dark:border-neutral-700">
<p class="text-[10px] font-bold text-neutral-400 uppercase">Capacity</p>
<p class="text-sm font-bold text-neutral-900 dark:text-white">54 Seats</p>
</div>
</div>
</div>
<div class="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
<span class="material-symbols-outlined text-[40px]">directions_bus</span>
</div>
</div>
</div>
<div class="flex-1 flex flex-col min-h-0">
<div class="flex items-center justify-between mb-3 px-1">
<div>
<h3 class="text-lg font-bold text-neutral-900 dark:text-white">Route A: Morning Loop</h3>
<p class="text-xs font-medium text-neutral-500">Est. Duration: 1h 30m</p>
</div>
<div class="bg-black/5 dark:bg-white/10 p-2 rounded-full">
<span class="material-symbols-outlined text-neutral-600 dark:text-neutral-300 text-xl">map</span>
</div>
</div>
<div class="flex-1 bg-white dark:bg-neutral-800 rounded-t-3xl shadow-inner-lg border border-neutral-100 dark:border-neutral-700 p-6 overflow-y-auto no-scrollbar">
<div class="relative">
<div class="absolute left-[19px] top-4 bottom-4 w-1 bg-neutral-100 dark:bg-neutral-700 rounded-full"></div>
<div class="relative flex gap-5 mb-8">
<div class="relative z-10 flex-none w-10 h-10 rounded-full bg-primary border-4 border-white dark:border-neutral-800 shadow-lg flex items-center justify-center">
<span class="material-symbols-outlined text-neutral-900 text-lg">flag</span>
</div>
<div class="flex-1 pt-1">
<div class="flex justify-between items-start mb-0.5">
<h4 class="text-lg font-bold text-neutral-900 dark:text-white leading-tight">Central Station</h4>
<span class="text-sm font-bold text-neutral-900 dark:text-white bg-primary/20 text-primary-900 px-2 py-0.5 rounded text-nowrap">07:00 AM</span>
</div>
<p class="text-sm text-neutral-500 font-medium">Start Point • 24 Students waiting</p>
</div>
</div>
<div class="relative flex gap-5 mb-8">
<div class="relative z-10 flex-none w-10 h-10 rounded-full bg-white dark:bg-neutral-700 border-4 border-neutral-200 dark:border-neutral-600 flex items-center justify-center">
<span class="text-sm font-black text-neutral-500 dark:text-neutral-300">2</span>
</div>
<div class="flex-1 pt-1">
<div class="flex justify-between items-start mb-0.5">
<h4 class="text-lg font-bold text-neutral-600 dark:text-neutral-300 leading-tight">North Square</h4>
<span class="text-sm font-bold text-neutral-500">07:25 AM</span>
</div>
<p class="text-sm text-neutral-400 font-medium">12 Students waiting</p>
</div>
</div>
<div class="relative flex gap-5 mb-8">
<div class="relative z-10 flex-none w-10 h-10 rounded-full bg-white dark:bg-neutral-700 border-4 border-neutral-200 dark:border-neutral-600 flex items-center justify-center">
<span class="text-sm font-black text-neutral-500 dark:text-neutral-300">3</span>
</div>
<div class="flex-1 pt-1">
<div class="flex justify-between items-start mb-0.5">
<h4 class="text-lg font-bold text-neutral-600 dark:text-neutral-300 leading-tight">Westside Dorms</h4>
<span class="text-sm font-bold text-neutral-500">07:55 AM</span>
</div>
<p class="text-sm text-neutral-400 font-medium">45 Students waiting</p>
</div>
</div>
<div class="relative flex gap-5">
<div class="relative z-10 flex-none w-10 h-10 rounded-full bg-neutral-900 dark:bg-white border-4 border-white dark:border-neutral-800 shadow-md flex items-center justify-center">
<span class="material-symbols-outlined text-white dark:text-neutral-900 text-lg">school</span>
</div>
<div class="flex-1 pt-1">
<div class="flex justify-between items-start mb-0.5">
<h4 class="text-lg font-bold text-neutral-900 dark:text-white leading-tight">Engineering Campus</h4>
<span class="text-sm font-bold text-neutral-900 dark:text-white">08:30 AM</span>
</div>
<p class="text-sm text-neutral-500 font-medium">Drop-off Point • Route End</p>
</div>
</div>
</div>
</div>
</div>
</main>
<nav class="bg-white dark:bg-[#1a1810] border-t border-neutral-200 dark:border-neutral-800 pb-safe z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
<div class="grid grid-cols-4 h-24">
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full group-hover:bg-neutral-100 dark:group-hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 text-[28px]">home</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 tracking-wide uppercase text-center leading-none">Home</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full group-hover:bg-neutral-100 dark:group-hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 text-[28px]">person</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 tracking-wide uppercase">Profile</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full group-hover:bg-neutral-100 dark:group-hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 text-[28px]">qr_code_scanner</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 tracking-wide uppercase text-center leading-none">Scan<br/>Attendance</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 relative bg-gradient-to-b from-primary/5 to-transparent">
<div class="absolute top-0 left-0 right-0 h-1 bg-primary mx-6 rounded-b-lg shadow-[0_2px_8px_rgba(242,204,13,0.4)]"></div>
<div class="p-1 rounded-full text-neutral-900 dark:text-white">
<span class="material-symbols-outlined text-primary text-[28px]">directions_bus</span>
</div>
<span class="text-[10px] font-extrabold text-neutral-900 dark:text-white tracking-wide uppercase text-center leading-none">Route<br/>&amp; Bus</span>
</button>
</div>
</nav>
</div>
</body></html>

<!-- Login Screen -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>SafeRoute Login - Driver</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                    },
                    fontFamily: {
                        "display": ["Inter", "Noto Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        body {
          min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="font-display bg-background-light dark:bg-background-dark text-[#1c190d] dark:text-white overflow-x-hidden antialiased">
<div class="relative flex h-full min-h-screen w-full flex-col group/design-root">
<div class="w-full bg-primary/20 dark:bg-primary/10">
<div class="@container">
<div class="@[480px]:px-4 @[480px]:py-3">
<div class="relative flex flex-col justify-end overflow-hidden h-[240px] @[480px]:rounded-lg bg-cover bg-center" data-alt="Yellow school bus abstract geometric pattern" style='background-image: linear-gradient(180deg, rgba(242, 204, 13, 0.1) 0%, rgba(248, 248, 245, 1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBov1jEAahVVOi7xXqnIHiTRv0nJWhTm8TGreQc8TEpS0ieLeAqoBpUcDV5BB5VVzeZrluRv2XBzXx0BK6XaDnVdM6umeM_G-WRdLi-Lb1SMbNOAEAdnee0AXXfyXv6kfn0i340wIWstwWwZeanG8DrYqqzdqxWqdxex-hU4QBQMAHX_6xMqC9YxOlDSyYGlI81lt02unydCbs_p3Qrl8SSnL1-D30b4Pp6kjR856p_RURFozSHHN-sdOamr8GHiaTUDj6o5Pp2P8Q");'>
<div class="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent"></div>
<div class="relative z-10 flex flex-col items-center p-6 text-center">
<div class="mb-2 flex items-center justify-center h-16 w-16 rounded-full bg-primary text-[#1c190d] shadow-lg">
<span class="material-symbols-outlined text-4xl">directions_bus</span>
</div>
<h1 class="text-[#1c190d] dark:text-white tracking-tight text-3xl font-bold leading-tight">SafeRoute</h1>
<p class="text-[#1c190d]/70 dark:text-white/70 text-sm font-medium mt-1">Track your campus ride</p>
</div>
</div>
</div>
</div>
</div>
<div class="flex-1 flex flex-col px-6 -mt-4 relative z-20">
<h2 class="text-[#1c190d] dark:text-white tracking-tight text-[28px] font-bold leading-tight text-center pb-2 pt-2">Welcome Back!</h2>
<p class="text-[#1c190d]/60 dark:text-white/60 text-base font-normal leading-normal pb-8 text-center">Please sign in to continue</p>
<form class="flex flex-col gap-5 max-w-[480px] w-full mx-auto" onsubmit="event.preventDefault();">
<div class="flex flex-col gap-2">
<p class="text-[#1c190d] dark:text-white text-sm font-semibold leading-normal ml-1">Select Role</p>
<div class="flex flex-row gap-6 px-1">
<label class="inline-flex items-center cursor-pointer">
<input class="form-radio text-primary focus:ring-primary focus:ring-offset-0 border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 h-5 w-5 transition-all duration-200" name="role" type="radio" value="parent"/>
<span class="ml-2 text-[#1c190d] dark:text-white text-sm font-medium">Parent</span>
</label>
<label class="inline-flex items-center cursor-pointer">
<input checked="" class="form-radio text-primary focus:ring-primary focus:ring-offset-0 border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 h-5 w-5 transition-all duration-200" name="role" type="radio" value="driver"/>
<span class="ml-2 text-[#1c190d] dark:text-white text-sm font-medium">Driver</span>
</label>
<label class="inline-flex items-center cursor-pointer">
<input class="form-radio text-primary focus:ring-primary focus:ring-offset-0 border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 h-5 w-5 transition-all duration-200" name="role" type="radio" value="admin"/>
<span class="ml-2 text-[#1c190d] dark:text-white text-sm font-medium">Admin</span>
</label>
</div>
</div>
<label class="flex flex-col flex-1">
<p class="text-[#1c190d] dark:text-white text-sm font-semibold leading-normal pb-2 ml-1">User ID</p>
<div class="relative">
<div class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c8e49] dark:text-[#f2cc0d]/70">
<span class="material-symbols-outlined text-[20px]">person</span>
</div>
<input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1c190d] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary h-14 placeholder:text-[#9c8e49]/60 dark:placeholder:text-white/30 pl-11 pr-4 text-base font-normal leading-normal transition-all duration-200" placeholder="Enter User ID" type="text" value="DR98765"/>
</div>
</label>
<label class="flex flex-col flex-1">
<div class="flex justify-between items-center pb-2 ml-1">
<p class="text-[#1c190d] dark:text-white text-sm font-semibold leading-normal">Password</p>
</div>
<div class="relative">
<div class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c8e49] dark:text-[#f2cc0d]/70">
<span class="material-symbols-outlined text-[20px]">lock</span>
</div>
<input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1c190d] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary h-14 placeholder:text-[#9c8e49]/60 dark:placeholder:text-white/30 pl-11 pr-12 text-base font-normal leading-normal transition-all duration-200" placeholder="••••••••" type="password" value=""/>
<button class="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c8e49] dark:text-[#f2cc0d]/70 hover:text-primary transition-colors" type="button">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
</div>
</label>
<div class="flex justify-end -mt-2">
<a class="text-sm font-medium text-primary hover:text-primary/80 transition-colors" href="#">Forgot Password?</a>
</div>
<div class="pt-4">
<button class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-primary text-[#1c190d] text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md shadow-primary/20">
<span class="truncate">Log In</span>
</button>
</div>
</form>
<div class="mt-auto pb-8 pt-8">
<div class="flex items-center justify-center gap-2 text-xs text-[#1c190d]/40 dark:text-white/40">
<span class="material-symbols-outlined text-[16px]">support_agent</span>
<span>Need help? Contact Transport Dept.</span>
</div>
</div>
</div>
</div>

</body></html>

<!-- Driver Share Location -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Driver Emergency Alert Sent</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                    boxShadow: {
                        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
                        'floating': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    }
                },
            },
        }
    </script>
<style>.slider-handle {
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .group:active .slider-handle {
            transform: translateX(10px) scale(0.98);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-neutral-900 dark:text-neutral-100 antialiased overflow-x-hidden selection:bg-primary/30">
<div class="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
<header class="flex items-center p-6 pb-2 justify-between z-10">
<div class="flex flex-col flex-1">
<h2 class="text-neutral-900 dark:text-white text-2xl font-extrabold leading-tight tracking-tight">Sadaat Malik</h2>
<div class="flex items-center gap-2 mt-0.5">
<span class="inline-block size-2 rounded-full bg-primary"></span>
<p class="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">Bus Driver #104</p>
</div>
</div>
<button class="flex h-10 items-center justify-center px-4 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 active:bg-neutral-100 dark:active:bg-neutral-700 transition-colors shadow-sm">
<p class="text-neutral-600 dark:text-neutral-300 text-xs font-bold tracking-wide uppercase">Logout</p>
</button>
</header>
<main class="flex-1 flex flex-col justify-center items-center gap-10 px-4 py-2">
<div class="flex flex-col items-center pt-4 pb-2">
<div class="flex items-center gap-2 mb-3">
<div class="size-3 rounded-full bg-neutral-400 animate-pulse"></div>
<span class="text-neutral-500 dark:text-neutral-400 text-sm font-bold tracking-wider uppercase">Current Status</span>
</div>
<h1 class="text-neutral-900 dark:text-white tracking-tight text-[40px] font-extrabold leading-none text-center">
                OFFLINE
            </h1>
<p class="text-neutral-500 dark:text-neutral-400 text-center mt-3 max-w-[280px] text-sm leading-relaxed font-medium">
                You are hidden from students. Start your route to broadcast location.
            </p>
</div>
<div class="flex flex-col items-center justify-center py-4 w-full">
<div class="group relative w-full h-[120px] bg-white dark:bg-neutral-800 rounded-full shadow-floating border border-neutral-200 dark:border-neutral-700 p-2 cursor-pointer select-none overflow-hidden active:scale-[0.99] transition-transform duration-200">
<div class="absolute inset-0 flex items-center justify-center pl-24 pointer-events-none">
<span class="text-xl font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">Swipe to Start</span>
<span class="material-symbols-outlined text-neutral-400 dark:text-neutral-500 ml-2 animate-pulse">chevron_right</span>
<span class="material-symbols-outlined text-neutral-400 dark:text-neutral-500 -ml-2 animate-pulse" style="animation-delay: 100ms;">chevron_right</span>
<span class="material-symbols-outlined text-neutral-400 dark:text-neutral-500 -ml-2 animate-pulse" style="animation-delay: 200ms;">chevron_right</span>
</div>
<div class="slider-handle h-full aspect-square rounded-full bg-neutral-100 dark:bg-neutral-700 shadow-lg border border-neutral-200 dark:border-neutral-600 flex items-center justify-center relative z-10">
<div class="size-16 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
<span class="material-symbols-outlined text-4xl">location_off</span>
</div>
</div>
</div>
<div class="mt-6 flex items-center gap-2 opacity-60">
<span class="material-symbols-outlined text-neutral-500 text-lg">touch_app</span>
<span class="text-sm font-medium text-neutral-500">Long press or slide to activate</span>
</div>
</div>
</main>
<nav class="bg-white dark:bg-[#1a1810] border-t border-neutral-200 dark:border-neutral-800 pb-safe z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
<div class="grid grid-cols-4 h-24">
<button class="group flex flex-col items-center justify-center gap-1.5 relative bg-gradient-to-b from-primary/5 to-transparent">
<div class="absolute top-0 left-0 right-0 h-1 bg-primary mx-4 rounded-b-lg shadow-[0_2px_8px_rgba(242,204,13,0.4)]"></div>
<div class="p-1 rounded-full text-neutral-900 dark:text-white">
<span class="material-symbols-outlined text-primary text-[28px]">home</span>
</div>
<span class="text-[10px] font-extrabold text-neutral-900 dark:text-white tracking-wide uppercase text-center leading-none">Home</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full group-hover:bg-neutral-100 dark:group-hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 text-[28px]">person</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 tracking-wide uppercase">Profile</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full group-hover:bg-neutral-100 dark:group-hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 text-[28px]">qr_code_scanner</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 tracking-wide uppercase text-center leading-none">Scan<br/>Attendance</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full group-hover:bg-neutral-100 dark:group-hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 text-[28px]">directions_bus</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 tracking-wide uppercase text-center leading-none">Route &amp;<br/>Bus Assigned</span>
</button>
</div>
</nav>
</div>
</body></html>

<!-- Driver Share Location -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Driver Home Screen - Route Active</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#1a1810",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                    boxShadow: {
                        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
                        'floating': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                        'status-glow': '0 0 40px -10px rgba(242, 204, 13, 0.4)',
                    }
                },
            },
        }
    </script>
<style type="text/tailwindcss">
        :root {
            --primary: #f2cc0d;
        }
        body {
            min-height: 100dvh;
        }
        .active-glow {
            animation: pulse-yellow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-yellow {
            0%, 100% { opacity: 1; }
            50% { opacity: .7; }
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-neutral-900 dark:text-neutral-100 antialiased overflow-x-hidden selection:bg-primary/30">
<div class="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
<header class="flex items-center p-6 pb-2 justify-between z-10">
<div class="flex flex-col flex-1">
<h2 class="text-neutral-900 dark:text-white text-2xl font-extrabold leading-tight tracking-tight">Sadaat Malik</h2>
<div class="flex items-center gap-2 mt-0.5">
<span class="inline-block size-2 rounded-full bg-primary active-glow"></span>
<p class="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">Bus Driver #104</p>
</div>
</div>
<button class="flex h-10 items-center justify-center px-4 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 active:bg-neutral-100 dark:active:bg-neutral-700 transition-colors shadow-sm">
<p class="text-neutral-600 dark:text-neutral-300 text-xs font-bold tracking-wide uppercase">Logout</p>
</button>
</header>
<main class="flex-1 flex flex-col px-6 py-4">
<div class="flex flex-col pt-2 pb-1">
<h1 class="text-neutral-900 dark:text-white text-3xl font-extrabold tracking-tight">Good Morning!</h1>
<p class="text-neutral-500 dark:text-neutral-400 text-sm font-medium mt-1">Route #104 is currently active.</p>
</div>
<div class="flex-1 flex flex-col items-center justify-center">
<div class="w-full flex flex-col items-center gap-6">
<div class="flex items-center gap-3 bg-white dark:bg-neutral-800/50 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-sm">
<span class="relative flex h-3 w-3">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
</span>
<span class="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest">Broadcasting Live</span>
</div>
<div class="relative w-full">
<div class="relative w-full h-[120px] bg-primary rounded-[40px] shadow-status-glow border-4 border-white dark:border-neutral-800 p-4 flex items-center justify-between transition-all">
<div class="flex flex-col justify-center pl-4">
<span class="text-2xl font-black text-neutral-900 uppercase tracking-tighter leading-none">Route Active</span>
<span class="text-sm font-bold text-neutral-900/60 mt-1">Bus #104 Tracking...</span>
</div>
<button class="h-20 aspect-square rounded-[28px] bg-white dark:bg-neutral-900 shadow-xl flex items-center justify-center active:scale-90 transition-transform">
<span class="material-symbols-outlined text-5xl text-neutral-900 dark:text-white">pause</span>
</button>
</div>
</div>
<div class="flex flex-col items-center gap-2 px-8 text-center">
<p class="text-neutral-500 dark:text-neutral-400 text-sm font-medium leading-relaxed">
                        Your location is being shared with students and staff.
                    </p>
<div class="flex items-center gap-2 opacity-60">
<span class="material-symbols-outlined text-neutral-500 text-lg">info</span>
<span class="text-xs font-bold text-neutral-500 uppercase tracking-wider">Tap button to pause or end</span>
</div>
</div>
</div>
</div>
</main>
<nav class="bg-white dark:bg-[#1a1810] border-t border-neutral-200 dark:border-neutral-800 pb-safe z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
<div class="grid grid-cols-4 h-24">
<button class="group flex flex-col items-center justify-center gap-1.5 relative bg-gradient-to-b from-primary/5 to-transparent">
<div class="absolute top-0 left-0 right-0 h-1 bg-primary mx-4 rounded-b-lg shadow-[0_2px_8px_rgba(242,204,13,0.4)]"></div>
<div class="p-1 rounded-full text-neutral-900 dark:text-white">
<span class="material-symbols-outlined text-primary text-[28px] fill-[1]">home</span>
</div>
<span class="text-[10px] font-extrabold text-neutral-900 dark:text-white tracking-wide uppercase text-center leading-none">Home</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full">
<span class="material-symbols-outlined text-neutral-400 dark:text-neutral-500 text-[28px]">person</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wide uppercase">Profile</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full">
<span class="material-symbols-outlined text-neutral-400 dark:text-neutral-500 text-[28px]">qr_code_scanner</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wide uppercase text-center leading-none">Scan Attendance</span>
</button>
<button class="group flex flex-col items-center justify-center gap-1.5 active:bg-neutral-50 dark:active:bg-white/5 transition-colors">
<div class="p-1 rounded-full">
<span class="material-symbols-outlined text-neutral-400 dark:text-neutral-500 text-[28px]">directions_bus</span>
</div>
<span class="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wide uppercase text-center leading-none">Route &amp; Bus</span>
</button>
</div>
</nav>
</div>

</body></html>






PARENT SCREEN:
<!-- Parent Announcements -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Parent Announcements - SafeRoute</title>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "primary-dark": "#cbb30b", /* Darker shade for text contrast */
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                        "surface-light": "#ffffff",
                        "surface-dark": "#2e2a1b",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .material-symbols-outlined {
            font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24
        }
        .material-symbols-outlined.filled {
            font-variation-settings:
            'FILL' 1,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex justify-center min-h-screen">
<!-- Mobile Container -->
<div class="w-full max-w-md bg-background-light dark:bg-background-dark relative flex flex-col h-screen overflow-hidden shadow-2xl">
<!-- Header -->
<header class="flex-none px-4 pt-6 pb-2 bg-background-light dark:bg-background-dark z-10">
<div class="flex items-center justify-between mb-4">
<h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Announcements</h2>
<button class="text-sm font-semibold text-yellow-700 dark:text-yellow-400 hover:opacity-80 transition-opacity">
                    Mark all read
                </button>
</div>
<!-- Tabs -->
<div class="flex gap-6 border-b border-gray-200 dark:border-gray-800">
<button class="pb-3 border-b-[3px] border-primary text-slate-900 dark:text-white font-semibold text-sm transition-colors">
                    All
                </button>
<button class="pb-3 border-b-[3px] border-transparent text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors">
                    Urgent
                </button>
<button class="pb-3 border-b-[3px] border-transparent text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors">
                    General
                </button>
</div>
</header>
<!-- Scrollable List Content -->
<main class="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 scrollbar-hide">
<!-- Urgent Item -->
<article class="relative flex flex-col gap-3 p-4 bg-yellow-50 dark:bg-[#38331a] rounded-xl border-l-4 border-primary shadow-sm active:scale-[0.99] transition-transform cursor-pointer">
<div class="flex justify-between items-start">
<div class="flex gap-3">
<div class="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#4a4428] text-amber-600 dark:text-primary shadow-sm shrink-0">
<span class="material-symbols-outlined">warning</span>
</div>
<div>
<div class="flex items-center gap-2">
<h3 class="font-semibold text-slate-900 dark:text-white text-base">Bus Route 5 Delayed</h3>
<span class="size-2 rounded-full bg-red-500 block"></span>
</div>
<p class="text-xs font-medium text-amber-700 dark:text-yellow-500 mt-0.5">Urgent Update</p>
</div>
</div>
<span class="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">10m ago</span>
</div>
<div class="pl-[52px]">
<p class="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                        Heavy traffic on Main St due to construction. Expected delay is approximately 15 minutes.
                    </p>
</div>
</article>
<!-- General Item 1 -->
<article class="relative flex gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.99] transition-transform cursor-pointer">
<div class="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
<span class="material-symbols-outlined">calendar_month</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start mb-1">
<h3 class="font-semibold text-slate-900 dark:text-white text-base truncate pr-2">Holiday Schedule</h3>
<div class="flex flex-col items-end gap-1">
<span class="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">2h ago</span>
<span class="size-2 rounded-full bg-primary block"></span>
</div>
</div>
<p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                        Reminder: No bus service on Monday, Nov 12th in observance of Veterans Day. Normal service resumes Tuesday.
                    </p>
</div>
</article>
<!-- General Item 2 -->
<article class="relative flex gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.99] transition-transform cursor-pointer">
<div class="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
<span class="material-symbols-outlined">build</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start mb-1">
<h3 class="font-semibold text-slate-900 dark:text-white text-base truncate pr-2">App Maintenance</h3>
<span class="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">Yesterday</span>
</div>
<p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                        Scheduled downtime this Saturday from 2 AM - 4 AM for system upgrades. Tracking will be unavailable.
                    </p>
</div>
</article>
<!-- Read Item -->
<article class="relative flex gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 opacity-70 active:scale-[0.99] transition-transform cursor-pointer">
<div class="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 shrink-0">
<span class="material-symbols-outlined">alt_route</span>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start mb-1">
<h3 class="font-semibold text-slate-900 dark:text-white text-base truncate pr-2">Route 3 Adjustment</h3>
<span class="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">2d ago</span>
</div>
<p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                        The stop at Lincoln Park has been moved 50 meters north for safety improvements.
                    </p>
</div>
</article>
<!-- Empty State Illustration Placeholder (Hidden by default, shown if no items) -->
<!-- 
            <div class="flex flex-col items-center justify-center py-12 text-center opacity-50">
                <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">inbox</span>
                <p class="text-gray-500 font-medium">No new announcements</p>
            </div> 
            -->
</main>
<!-- Bottom Navigation -->
<nav class="absolute bottom-0 w-full bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-between items-end z-20 pb-6">
<button class="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors group">
<span class="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">home</span>
<span class="text-[10px] font-medium">Home</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors group">
<span class="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform" data-location="City Map View">map</span>
<span class="text-[10px] font-medium">Map</span>
</button>
<button class="flex flex-col items-center gap-1 text-primary dark:text-primary transition-colors">
<div class="relative">
<span class="material-symbols-outlined filled text-[28px]">notifications</span>
<span class="absolute top-0 right-0 size-2.5 bg-red-500 border-2 border-white dark:border-surface-dark rounded-full"></span>
</div>
<span class="text-[10px] font-medium">Alerts</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors group">
<span class="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">person</span>
<span class="text-[10px] font-medium">Profile</span>
</button>
</nav>
</div>
</body></html>

<!-- Parent Track Bus, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Parent Track Bus - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#374151", // Gray 700
                        secondary: "#F59E0B", // Amber 500 (School Bus Yellow)
                        "background-light": "#F9FAFB", // Gray 50
                        "background-dark": "#111827", // Gray 900
                        "surface-light": "#FFFFFF",
                        "surface-dark": "#1F2937", // Gray 800
                        "map-road-light": "#E5E7EB",
                        "map-road-dark": "#374151",
                    },
                    fontFamily: {
                        display: ["Inter", "sans-serif"],
                        body: ["Inter", "sans-serif"],
                    },
                    borderRadius: {
                        DEFAULT: "0.5rem",
                        xl: "1rem",
                        '2xl': "1.5rem",
                    },
                },
            },
        };
    </script>
<style>
        .bus-pulse {
            animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.33); opacity: 0.8; }
            80%, 100% { opacity: 0; transform: scale(1.5); }
        }
        body {
            min-height: 100dvh;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-body min-h-screen flex flex-col items-center justify-center p-0">
<div class="w-full max-w-md h-[844px] bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden relative border-x border-gray-200 dark:border-gray-800 sm:rounded-[3rem] flex flex-col">
<div class="absolute top-0 w-full h-12 flex justify-between items-center px-8 z-50 text-xs font-semibold text-gray-800 dark:text-white pointer-events-none">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-primary pt-12 pb-4 px-6 rounded-b-[2rem] shadow-lg z-30 relative shrink-0">
<div class="flex justify-between items-center mb-4">
<button class="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<h1 class="text-white text-lg font-bold tracking-wide">Track Bus</h1>
<button class="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
<span class="material-symbols-outlined">notifications</span>
</button>
</div>
<div class="bg-surface-light dark:bg-surface-dark p-3.5 rounded-2xl shadow-md flex items-center justify-between border-l-4 border-secondary">
<div class="flex items-center gap-3">
<div class="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
<span class="material-symbols-outlined text-gray-700 dark:text-gray-300">directions_bus</span>
</div>
<div>
<p class="text-sm font-bold text-gray-800 dark:text-white">Bus #42 - Route A</p>
<p class="text-[11px] text-gray-500 dark:text-gray-400">Driver: Malik Haris</p>
</div>
</div>
<div class="text-right">
<p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tighter">Arriving in</p>
<p class="text-lg font-bold text-secondary">5 min</p>
</div>
</div>
</header>
<main class="flex-1 relative w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
<div class="absolute inset-0 z-0">
<img alt="Map of Islamabad G10/4" class="w-full h-full object-cover opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-normal grayscale contrast-125 scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_6I-zKWYgohlKjm0nMwlMzYseQkkZApVICAFJSPt7h9PJbYRHTugjCaf5SeheNnZwTg3zjX8LkrUVy2Nh0Qsm1_1Pg6W4BNTEZhtff8Wuzg2lafnTm7ke7wwrOCswDJGgG-o3O6oxaYXxWMQOyHeHUxUsMfOXDfKkaP0RaeLkswhplU7L_D8ShKw9asLdKinIoxXer9PrtM8dqmcN9gw5FpZidY66obUfxPyBkNrcnLLHx_9qG6TJhS7OLAzAB2O0suXaYaubroY"/>
</div>
<div class="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-secondary text-sm">location_on</span>
<span class="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Islamabad G10/4</span>
</div>
</div>
<svg class="absolute inset-0 w-full h-full z-1 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
<path class="drop-shadow-md" d="M 60 120 Q 200 120 220 380 T 380 600" fill="none" stroke="#F59E0B" stroke-dasharray="8 4" stroke-linecap="round" stroke-width="5"></path>
<circle class="dark:fill-gray-400" cx="60" cy="120" fill="#374151" r="5"></circle>
<circle class="dark:fill-gray-400" cx="220" cy="380" fill="#374151" r="5"></circle>
<circle cx="380" cy="600" fill="#374151" r="5" stroke="white" stroke-width="2"></circle>
</svg>
<div class="absolute top-[35%] left-[55%] -translate-x-1/2 -translate-y-1/2 z-20">
<div class="relative">
<div class="absolute -inset-4 bg-secondary/30 rounded-full bus-pulse"></div>
<div class="relative z-10 bg-secondary text-gray-900 p-3 rounded-full shadow-xl border-2 border-white dark:border-gray-800">
<span class="material-symbols-outlined text-2xl block transform -rotate-45">directions_bus</span>
</div>
<div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-light dark:bg-surface-dark px-2.5 py-1.5 rounded-lg shadow-lg text-[10px] font-bold whitespace-nowrap border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex flex-col items-center">
<span>MOVING • 45KM/H</span>
<div class="w-2 h-2 bg-surface-light dark:bg-surface-dark rotate-45 absolute -bottom-1 border-r border-b border-gray-200 dark:border-gray-700"></div>
</div>
</div>
</div>
<div class="absolute top-[68%] left-[70%] z-10">
<div class="flex flex-col items-center">
<div class="bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
<span class="material-symbols-outlined text-xs block">person</span>
</div>
<div class="bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow mt-1 border border-gray-100 dark:border-gray-700">
<span class="text-[9px] font-bold text-gray-700 dark:text-gray-200 uppercase">Dhok Pracha</span>
</div>
</div>
</div>
<div class="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
<button class="w-10 h-10 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
<span class="material-symbols-outlined">add</span>
</button>
<button class="w-10 h-10 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
<span class="material-symbols-outlined">remove</span>
</button>
<button class="w-10 h-10 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center border border-primary">
<span class="material-symbols-outlined">my_location</span>
</button>
</div>
<div class="absolute bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark rounded-t-[2.5rem] shadow-[0_-12px_40px_rgba(0,0,0,0.15)] z-40 pb-20">
<div class="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mt-4 mb-2"></div>
<div class="px-6">
<div class="flex justify-between items-center mb-4">
<h3 class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Route Timeline</h3>
<span class="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">LIVE TRACKING</span>
</div>
<div class="flex items-start gap-4 overflow-x-auto no-scrollbar pb-4 pt-2">
<div class="flex flex-col items-center min-w-[80px] opacity-40">
<div class="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-[10px] font-bold text-white mb-1">
<span class="material-symbols-outlined text-sm">check</span>
</div>
<span class="text-[11px] font-bold text-gray-800 dark:text-white">G-11</span>
</div>
<div class="mt-3 min-w-[30px] h-0.5 bg-gray-200 dark:bg-gray-700"></div>
<div class="flex flex-col items-center min-w-[100px]">
<div class="w-7 h-7 rounded-full bg-secondary ring-4 ring-secondary/20 flex items-center justify-center text-[10px] font-bold text-gray-900 mb-1 animate-pulse">
<span class="material-symbols-outlined text-sm">directions_bus</span>
</div>
<span class="text-[11px] font-bold text-gray-900 dark:text-white">Golra</span>
<span class="text-[9px] text-secondary font-bold">In Progress</span>
</div>
<div class="mt-3 min-w-[30px] h-0.5 bg-gray-200 dark:bg-gray-700"></div>
<div class="flex flex-col items-center min-w-[100px]">
<div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white mb-1">
<span class="material-symbols-outlined text-sm">location_on</span>
</div>
<span class="text-[11px] font-bold text-gray-800 dark:text-white">Dhok Pracha</span>
<span class="text-[9px] text-gray-500">8:55 AM</span>
</div>
</div>
<div class="flex gap-3 mt-1">
<button class="flex-1 bg-secondary hover:bg-amber-400 text-gray-900 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 duration-200">
<span class="material-symbols-outlined text-[18px]">call</span>
<span class="text-xs font-black uppercase tracking-wider">Call Driver</span>
</button>
<button class="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 duration-200 border border-gray-200 dark:border-gray-600">
<span class="material-symbols-outlined text-[18px]">share</span>
<span class="text-xs font-black uppercase tracking-wider">Share ETA</span>
</button>
</div>
</div>
</div>
</main>
<nav class="absolute bottom-0 w-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex justify-around items-center py-3 pb-8 z-50">
<button class="flex flex-col items-center gap-1 w-16 group">
<span class="material-symbols-outlined text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">dashboard</span>
<span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">Home</span>
</button>
<button class="flex flex-col items-center gap-1 w-16 group">
<div class="relative">
<span class="material-symbols-outlined text-primary dark:text-white text-2xl">map</span>
<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full ring-2 ring-white dark:ring-gray-800"></span>
</div>
<span class="text-[10px] font-bold text-primary dark:text-white">Track</span>
</button>
<button class="flex flex-col items-center gap-1 w-16 group">
<span class="material-symbols-outlined text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">history</span>
<span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">History</span>
</button>
<button class="flex flex-col items-center gap-1 w-16 group">
<span class="material-symbols-outlined text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">settings</span>
<span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">Settings</span>
</button>
</nav>
</div>
<style>
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>

</body></html>

<!-- Login Screen -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>SafeRoute Login</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f2cc0d",
                        "background-light": "#f8f8f5",
                        "background-dark": "#221f10",
                    },
                    fontFamily: {
                        "display": ["Inter", "Noto Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        body {
          min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="font-display bg-background-light dark:bg-background-dark text-[#1c190d] dark:text-white overflow-x-hidden antialiased">
<div class="relative flex h-full min-h-screen w-full flex-col group/design-root">
<div class="w-full bg-primary/20 dark:bg-primary/10">
<div class="@container">
<div class="@[480px]:px-4 @[480px]:py-3">
<div class="relative flex flex-col justify-end overflow-hidden h-[240px] @[480px]:rounded-lg bg-cover bg-center" data-alt="Yellow school bus abstract geometric pattern" style='background-image: linear-gradient(180deg, rgba(242, 204, 13, 0.1) 0%, rgba(248, 248, 245, 1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBov1jEAahVVOi7xXqnIHiTRv0nJWhTm8TGreQc8TEpS0ieLeAqoBpUcDV5BB5VVzeZrluRv2XBzXx0BK6XaDnVdM6umeM_G-WRdLi-Lb1SMbNOAEAdnee0AXXfyXv6kfn0i340wIWstwWwZeanG8DrYqqzdqxWqdxex-hU4QBQMAHX_6xMqC9YxOlDSyYGlI81lt02unydCbs_p3Qrl8SSnL1-D30b4Pp6kjR856p_RURFozSHHN-sdOamr8GHiaTUDj6o5Pp2P8Q");'>
<div class="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent"></div>
<div class="relative z-10 flex flex-col items-center p-6 text-center">
<div class="mb-2 flex items-center justify-center h-16 w-16 rounded-full bg-primary text-[#1c190d] shadow-lg">
<span class="material-symbols-outlined text-4xl">directions_bus</span>
</div>
<h1 class="text-[#1c190d] dark:text-white tracking-tight text-3xl font-bold leading-tight">SafeRoute</h1>
<p class="text-[#1c190d]/70 dark:text-white/70 text-sm font-medium mt-1">Track your campus ride</p>
</div>
</div>
</div>
</div>
</div>
<div class="flex-1 flex flex-col px-6 -mt-4 relative z-20">
<h2 class="text-[#1c190d] dark:text-white tracking-tight text-[28px] font-bold leading-tight text-center pb-2 pt-2">Welcome Back!</h2>
<p class="text-[#1c190d]/60 dark:text-white/60 text-base font-normal leading-normal pb-8 text-center">Please sign in to continue</p>
<form class="flex flex-col gap-5 max-w-[480px] w-full mx-auto" onsubmit="event.preventDefault();">
<div class="flex flex-col gap-2">
<p class="text-[#1c190d] dark:text-white text-sm font-semibold leading-normal ml-1">Select Role</p>
<div class="flex flex-row gap-6 px-1">
<label class="inline-flex items-center cursor-pointer">
<input checked="" class="form-radio text-primary focus:ring-primary focus:ring-offset-0 border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 h-5 w-5 transition-all duration-200" name="role" type="radio" value="parent"/>
<span class="ml-2 text-[#1c190d] dark:text-white text-sm font-medium">Parent</span>
</label>
<label class="inline-flex items-center cursor-pointer">
<input class="form-radio text-primary focus:ring-primary focus:ring-offset-0 border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 h-5 w-5 transition-all duration-200" name="role" type="radio" value="driver"/>
<span class="ml-2 text-[#1c190d] dark:text-white text-sm font-medium">Driver</span>
</label>
<label class="inline-flex items-center cursor-pointer">
<input class="form-radio text-primary focus:ring-primary focus:ring-offset-0 border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 h-5 w-5 transition-all duration-200" name="role" type="radio" value="admin"/>
<span class="ml-2 text-[#1c190d] dark:text-white text-sm font-medium">Admin</span>
</label>
</div>
</div>
<label class="flex flex-col flex-1">
<p class="text-[#1c190d] dark:text-white text-sm font-semibold leading-normal pb-2 ml-1">User ID</p>
<div class="relative">
<div class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c8e49] dark:text-[#f2cc0d]/70">
<span class="material-symbols-outlined text-[20px]">person</span>
</div>
<input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1c190d] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary h-14 placeholder:text-[#9c8e49]/60 dark:placeholder:text-white/30 pl-11 pr-4 text-base font-normal leading-normal transition-all duration-200" placeholder="Enter User ID" type="text" value="PR12345"/>
</div>
</label>
<label class="flex flex-col flex-1">
<div class="flex justify-between items-center pb-2 ml-1">
<p class="text-[#1c190d] dark:text-white text-sm font-semibold leading-normal">Password</p>
</div>
<div class="relative">
<div class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c8e49] dark:text-[#f2cc0d]/70">
<span class="material-symbols-outlined text-[20px]">lock</span>
</div>
<input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1c190d] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e8e4ce] dark:border-white/20 bg-white dark:bg-white/5 focus:border-primary h-14 placeholder:text-[#9c8e49]/60 dark:placeholder:text-white/30 pl-11 pr-12 text-base font-normal leading-normal transition-all duration-200" placeholder="••••••••" type="password" value=""/>
<button class="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c8e49] dark:text-[#f2cc0d]/70 hover:text-primary transition-colors" type="button">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
</div>
</label>
<div class="flex justify-end -mt-2">
<a class="text-sm font-medium text-primary hover:text-primary/80 transition-colors" href="#">Forgot Password?</a>
</div>
<div class="pt-4">
<button class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-primary text-[#1c190d] text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md shadow-primary/20">
<span class="truncate">Log In</span>
</button>
</div>
</form>
<div class="mt-auto pb-8 pt-8">
<div class="flex items-center justify-center gap-2 text-xs text-[#1c190d]/40 dark:text-white/40">
<span class="material-symbols-outlined text-[16px]">support_agent</span>
<span>Need help? Contact Transport Dept.</span>
</div>
</div>
</div>
</div>
</body></html>

<!-- Admin Dashboard Home, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Parent Manage Notifications - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            yellow: '#F59E0B', 
                            dark: '#111827',
                            gray: '#F3F4F6',
                        }
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 h-screen w-full flex justify-center items-center overflow-hidden">
<div class="w-full h-full max-w-md bg-gray-50 relative flex flex-col shadow-2xl overflow-hidden">
<div class="bg-white w-full h-12 flex justify-between items-end px-6 pb-2 text-xs font-medium text-gray-900 z-50">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
<div class="flex items-center gap-4">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-600 transition-colors group">
<span class="material-symbols-outlined text-2xl group-hover:text-yellow-600">arrow_back</span>
</button>
<div>
<h1 class="font-bold text-lg leading-none text-gray-900">Notifications</h1>
<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Preferences</p>
</div>
</div>
<button class="relative p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
<span class="material-symbols-outlined">settings</span>
</button>
</header>
<main class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-6 bg-gray-50">
<div>
<h2 class="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 px-1">Alert Settings</h2>
<div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
<div class="p-5 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
<span class="material-symbols-outlined">notifications_active</span>
</div>
<div>
<h3 class="font-bold text-gray-900 text-sm">Arrival Push Notify</h3>
<p class="text-xs text-gray-500 mt-0.5">Get notified when bus is nearby</p>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
</label>
</div>
<div class="p-5 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
<span class="material-symbols-outlined">schedule_send</span>
</div>
<div>
<h3 class="font-bold text-gray-900 text-sm">Start Notification</h3>
<p class="text-xs text-gray-500 mt-0.5">Alert when the route starts</p>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
</label>
</div>
<div class="p-5 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
<span class="material-symbols-outlined">child_care</span>
</div>
<div>
<h3 class="font-bold text-gray-900 text-sm">On Board Child Notification</h3>
<p class="text-xs text-gray-500 mt-0.5">Know when Amna is on board</p>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
</label>
</div>
</div>
</div>
<div>
<h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 px-1">Recent Activity</h3>
<div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
<div class="p-4 flex gap-3 items-start">
<span class="material-symbols-outlined text-yellow-500 text-lg mt-0.5">directions_bus</span>
<div class="flex-1">
<div class="flex justify-between items-start">
<p class="text-sm text-gray-900 font-medium">Bus #42 is arriving</p>
<span class="text-[10px] text-gray-400 whitespace-nowrap">2m ago</span>
</div>
<p class="text-xs text-gray-500 mt-0.5">Approaching your location</p>
</div>
</div>
<div class="p-4 flex gap-3 items-start">
<span class="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
<div class="flex-1">
<div class="flex justify-between items-start">
<p class="text-sm text-gray-900 font-medium">Amna safely on board</p>
<span class="text-[10px] text-gray-400 whitespace-nowrap">6h ago</span>
</div>
<p class="text-xs text-gray-500 mt-0.5">Checked in at 7:15 AM</p>
</div>
</div>
<div class="p-4 flex gap-3 items-start">
<span class="material-symbols-outlined text-blue-500 text-lg mt-0.5">schedule</span>
<div class="flex-1">
<div class="flex justify-between items-start">
<p class="text-sm text-gray-900 font-medium">Morning Route Started</p>
<span class="text-[10px] text-gray-400 whitespace-nowrap">7h ago</span>
</div>
<p class="text-xs text-gray-500 mt-0.5">Bus #42 left the station</p>
</div>
</div>
</div>
</div>
<div class="px-2">
<p class="text-[11px] text-gray-400 text-center leading-relaxed">
                Push notifications are sent to your current device. To receive alerts via SMS or Email, please visit your <a class="text-yellow-600 font-medium hover:underline" href="#">Profile Settings</a>.
            </p>
</div>
</main>
<nav class="bg-white border-t border-gray-100 flex justify-between items-start px-2 py-3 pb-8 z-50 w-full shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
<a class="flex-1 flex flex-col items-center gap-1 group w-16 text-yellow-600" href="#">
<span class="material-symbols-outlined text-[26px]" style="font-variation-settings: 'FILL' 1;">home</span>
<span class="text-[10px] font-bold">Home</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">map</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Map</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">calendar_month</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Schedule</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">feedback</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Feedback</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">person</span>
<span class="text-[10px] font-medium leading-none mt-0.5 group-hover:text-gray-600">Profile</span>
</a>
</nav>
</div>

</body></html>

<!-- Admin Dashboard Home, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Parent Profile Screen - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            yellow: '#F59E0B', 
                            dark: '#111827',
                            gray: '#F3F4F6',
                        }
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 h-screen w-full flex justify-center items-center overflow-hidden">
<div class="w-full h-full max-w-md bg-gray-50 relative flex flex-col shadow-2xl overflow-hidden">
<div class="bg-white w-full h-12 flex justify-between items-end px-6 pb-2 text-xs font-medium text-gray-900 z-50">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
<div class="flex items-center gap-4">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-600 transition-colors group">
<span class="material-symbols-outlined text-2xl group-hover:text-yellow-600">menu</span>
</button>
<h1 class="font-bold text-lg leading-none text-gray-900">My Profile</h1>
</div>
<button class="relative p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors hover:text-yellow-600">
<span class="material-symbols-outlined">settings</span>
</button>
</header>
<main class="flex-1 overflow-y-auto bg-gray-50 p-6 scroll-smooth pb-6">
<div class="flex flex-col items-start mb-6 pt-2">
<h2 class="text-2xl font-bold text-gray-900">Mrs Safdr</h2>
<p class="text-sm text-gray-500 font-medium">Parent Account</p>
</div>
<section class="mb-6">
<h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Parent Information</h3>
<div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
<div class="p-4 border-b border-gray-50 flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
<span class="material-symbols-outlined">badge</span>
</div>
<div>
<p class="text-[10px] uppercase text-gray-400 font-bold tracking-wide">Parent ID</p>
<p class="text-sm font-semibold text-gray-900">#P-8832</p>
</div>
</div>
<div class="p-4 border-b border-gray-50 flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
<span class="material-symbols-outlined">call</span>
</div>
<div>
<p class="text-[10px] uppercase text-gray-400 font-bold tracking-wide">Contact Number</p>
<p class="text-sm font-semibold text-gray-900">0300-1234567</p>
</div>
</div>
<div class="p-4 flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
<span class="material-symbols-outlined">mail</span>
</div>
<div>
<p class="text-[10px] uppercase text-gray-400 font-bold tracking-wide">Email Address</p>
<p class="text-sm font-semibold text-gray-900">mrs.safdr@example.com</p>
</div>
</div>
</div>
</section>
<section class="mb-8">
<div class="flex items-center justify-between mb-3 px-1">
<h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Student Profile</h3>
</div>
<div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden group">
<div class="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-yellow-50 to-transparent rounded-bl-full -mr-6 -mt-6 opacity-60"></div>
<div class="flex items-center gap-4 mb-6 relative z-10">
<div class="w-16 h-16 rounded-full bg-blue-50 border-2 border-white shadow-md flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-3xl text-blue-500">face</span>
</div>
<div>
<h4 class="font-bold text-gray-900 text-lg">Amna</h4>
<span class="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1 mt-1">
<span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Active Student
                        </span>
</div>
</div>
<div class="grid grid-cols-2 gap-y-5 gap-x-4 relative z-10">
<div>
<p class="text-[10px] uppercase text-gray-400 font-bold tracking-wide mb-1">Registration ID</p>
<p class="text-sm font-semibold text-gray-800">SR-2024-042</p>
</div>
<div>
<p class="text-[10px] uppercase text-gray-400 font-bold tracking-wide mb-1">Grade</p>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-sm text-yellow-500">school</span>
<p class="text-sm font-semibold text-gray-800">5th Grade</p>
</div>
</div>
<div>
<p class="text-[10px] uppercase text-gray-400 font-bold tracking-wide mb-1">Date of Birth</p>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-sm text-gray-400">cake</span>
<p class="text-sm font-semibold text-gray-800">15/03/2018</p>
</div>
</div>
<div>
<p class="text-[10px] uppercase text-gray-400 font-bold tracking-wide mb-1">Assigned Bus</p>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-sm text-gray-400">directions_bus</span>
<p class="text-sm font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">Bus #42</p>
</div>
</div>
<div class="col-span-2 pt-4 border-t border-gray-50 mt-1">
<p class="text-[10px] uppercase text-gray-400 font-bold tracking-wide mb-1">Major Subject</p>
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-purple-500"></span>
<p class="text-sm font-semibold text-gray-800">Computer Science</p>
</div>
</div>
</div>
</div>
</section>
<section>
<h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Support</h3>
<div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-50">
<button class="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors group text-left">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-gray-400 group-hover:text-yellow-500 transition-colors">help</span>
<span class="text-sm font-semibold text-gray-700">Help Center</span>
</div>
<span class="material-symbols-outlined text-gray-300 text-lg">chevron_right</span>
</button>
<button class="w-full p-4 flex items-center justify-between hover:bg-red-50 active:bg-red-100 transition-colors group text-left">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-red-400 group-hover:text-red-500 transition-colors">logout</span>
<span class="text-sm font-semibold text-red-600">Log Out</span>
</div>
</button>
</div>
</section>
<p class="text-center text-[10px] text-gray-400 mt-8 mb-4">SafeRoute App v2.4.0 (Build 2024)</p>
</main>
<nav class="bg-white border-t border-gray-100 flex justify-between items-start px-2 py-3 pb-8 z-50 w-full shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
<a class="flex-1 flex flex-col items-center gap-1 group w-16 text-gray-400 hover:text-yellow-600 transition-colors" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">home</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Home</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">map</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Map</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">calendar_month</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Schedule</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">feedback</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Feedback</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group w-16 text-yellow-600" href="#">
<span class="material-symbols-outlined text-[26px]" style="font-variation-settings: 'FILL' 1;">person</span>
<span class="text-[10px] font-bold leading-none mt-0.5">Profile</span>
</a>
</nav>
</div>

</body></html>

<!-- Admin Dashboard Home, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Parent Schedule - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            yellow: '#F59E0B',
                            dark: '#111827',
                            gray: '#F3F4F6',
                        }
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 h-screen w-full flex justify-center items-center overflow-hidden">
<div class="w-full h-full max-w-md bg-gray-50 relative flex flex-col shadow-2xl overflow-hidden">
<div class="bg-white w-full h-12 flex justify-between items-end px-6 pb-2 text-xs font-medium text-gray-900 z-50">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
<div class="flex items-center gap-4">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-600 transition-colors group">
<span class="material-symbols-outlined text-2xl group-hover:text-yellow-600">menu</span>
</button>
<div>
<h1 class="font-bold text-lg leading-none text-gray-900">SafeRoute</h1>
<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Parent Portal</p>
</div>
</div>
<button class="relative p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full border border-white"></span>
</button>
</header>
<main class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-6 bg-gray-50">
<div class="flex flex-col gap-4">
<div class="flex items-center justify-between">
<h2 class="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
<div class="flex items-center gap-1 text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
<span class="text-xs font-semibold">Oct 23 - 27</span>
<span class="material-symbols-outlined text-sm">calendar_today</span>
</div>
</div>
<div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-blue-50 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
<span class="material-symbols-outlined text-blue-500 text-xl">face</span>
</div>
<div>
<span class="block text-sm font-bold text-gray-900">Amna</span>
<span class="text-xs text-gray-500">Bus #42 • Route A</span>
</div>
</div>
<button class="text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full hover:bg-yellow-100 transition-colors">
                        Change
                    </button>
</div>
<div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
<div class="flex items-center gap-1.5 mb-3">
<span class="material-symbols-outlined text-gray-400 text-sm">badge</span>
<span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Driver Details</span>
</div>
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
<span class="material-symbols-outlined text-2xl">directions_bus</span>
</div>
<div>
<h3 class="text-sm font-bold text-gray-900">Sadaat Malik</h3>
<p class="text-xs text-gray-500">+1 (555) 012-3456</p>
</div>
</div>
<div class="flex items-center gap-2">
<button class="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center hover:bg-yellow-100 transition-colors">
<span class="material-symbols-outlined text-lg">call</span>
</button>
<button class="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors">
<span class="material-symbols-outlined text-lg">chat_bubble</span>
</button>
</div>
</div>
</div>
</div>
<div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
<div class="flex items-center justify-between mb-3">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-gray-400 text-sm">admin_panel_settings</span>
<span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Upload</span>
</div>
<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                        CSV Parsed
                    </span>
</div>
<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-yellow-200 transition-colors cursor-pointer">
<div class="h-10 w-10 bg-green-100 rounded flex items-center justify-center shrink-0 shadow-sm">
<span class="material-symbols-outlined text-green-600">table_view</span>
</div>
<div class="flex-1 min-w-0">
<p class="text-sm font-bold text-gray-900 truncate group-hover:text-yellow-700 transition-colors">Schedule_Wk42_Final.csv</p>
<p class="text-xs text-gray-500">Uploaded Oct 22 • 145 KB</p>
</div>
<button class="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
<span class="material-symbols-outlined">visibility</span>
</button>
</div>
<div class="mt-3 flex items-center gap-2">
<span class="material-symbols-outlined text-gray-400 text-sm">info</span>
<p class="text-[10px] text-gray-500 leading-tight">This schedule was automatically generated from the administrator's latest CSV file upload.</p>
</div>
</div>
<div class="space-y-4">
<div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex gap-4 opacity-70 hover:opacity-100 transition-opacity">
<div class="flex flex-col items-center justify-center w-12 shrink-0 bg-gray-50 rounded-xl h-full py-3 border border-gray-100">
<span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mon</span>
<span class="text-xl font-bold text-gray-900">23</span>
</div>
<div class="flex-1 space-y-4 relative py-1">
<div class="absolute left-[7px] top-3 bottom-3 w-0.5 bg-gray-100 -z-0"></div>
<div class="flex items-start gap-3 relative z-10">
<div class="w-4 h-4 rounded-full bg-yellow-100 border-[3px] border-white ring-1 ring-yellow-400 shrink-0 mt-0.5"></div>
<div class="flex justify-between w-full items-start">
<div>
<span class="block text-sm font-bold text-gray-900">07:30 AM</span>
<span class="text-xs text-gray-500">Pickup from Home</span>
</div>
<span class="material-symbols-outlined text-gray-300 text-lg">home</span>
</div>
</div>
<div class="flex items-start gap-3 relative z-10">
<div class="w-4 h-4 rounded-full bg-gray-200 border-[3px] border-white ring-1 ring-gray-300 shrink-0 mt-0.5"></div>
<div class="flex justify-between w-full items-start">
<div>
<span class="block text-sm font-bold text-gray-900">03:30 PM</span>
<span class="text-xs text-gray-500">Drop-off at Home</span>
</div>
<span class="material-symbols-outlined text-gray-300 text-lg">school</span>
</div>
</div>
</div>
</div>
<div class="bg-white p-4 rounded-2xl border-2 border-yellow-400 shadow-md flex gap-4 relative overflow-hidden">
<div class="absolute top-0 right-0 px-3 py-1 bg-yellow-400 rounded-bl-xl text-[10px] font-bold text-gray-900 uppercase tracking-wide z-20">
                        Today
                    </div>
<div class="flex flex-col items-center justify-center w-12 shrink-0 bg-yellow-50 rounded-xl h-full py-3 border border-yellow-100">
<span class="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">Tue</span>
<span class="text-xl font-bold text-gray-900">24</span>
</div>
<div class="flex-1 space-y-4 relative py-1">
<div class="absolute left-[7px] top-3 bottom-3 w-0.5 bg-yellow-100 -z-0"></div>
<div class="flex items-start gap-3 relative z-10">
<div class="w-4 h-4 rounded-full bg-green-500 border-[3px] border-white ring-1 ring-green-500 shrink-0 mt-0.5 shadow-sm"></div>
<div class="flex justify-between w-full items-start">
<div>
<span class="block text-sm font-bold text-gray-900 line-through decoration-gray-400 decoration-2">07:30 AM</span>
<span class="text-xs text-green-600 font-medium">Pickup Completed</span>
</div>
<span class="material-symbols-outlined text-green-500 text-lg">check_circle</span>
</div>
</div>
<div class="flex items-start gap-3 relative z-10">
<div class="w-4 h-4 rounded-full bg-white border-[4px] border-yellow-500 shrink-0 mt-0.5 shadow-sm animate-pulse"></div>
<div class="flex justify-between w-full items-start">
<div>
<span class="block text-sm font-bold text-gray-900">03:30 PM</span>
<span class="text-xs text-gray-500">Drop-off at Home</span>
<span class="inline-block mt-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded">Next</span>
</div>
<span class="material-symbols-outlined text-yellow-500 text-lg">directions_bus</span>
</div>
</div>
</div>
</div>
<div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex gap-4 group hover:border-yellow-200 transition-colors">
<div class="flex flex-col items-center justify-center w-12 shrink-0 bg-gray-50 group-hover:bg-yellow-50/50 rounded-xl h-full py-3 border border-gray-100 transition-colors">
<span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Wed</span>
<span class="text-xl font-bold text-gray-900">25</span>
</div>
<div class="flex-1 space-y-4 relative py-1">
<div class="absolute left-[7px] top-3 bottom-3 w-0.5 bg-gray-100 -z-0"></div>
<div class="flex items-start gap-3 relative z-10">
<div class="w-4 h-4 rounded-full bg-yellow-100 border-[3px] border-white ring-1 ring-yellow-400 shrink-0 mt-0.5"></div>
<div class="flex justify-between w-full items-start">
<div>
<span class="block text-sm font-bold text-gray-900">07:30 AM</span>
<span class="text-xs text-gray-500">Pickup from Home</span>
</div>
<span class="material-symbols-outlined text-gray-300 text-lg">home</span>
</div>
</div>
<div class="flex items-start gap-3 relative z-10">
<div class="w-4 h-4 rounded-full bg-orange-100 border-[3px] border-white ring-1 ring-orange-300 shrink-0 mt-0.5"></div>
<div class="flex justify-between w-full items-start">
<div>
<span class="block text-sm font-bold text-gray-900">01:00 PM</span>
<span class="text-xs text-orange-600 font-medium">Early Drop-off (Staff Dev)</span>
</div>
<span class="material-symbols-outlined text-orange-400 text-lg">warning</span>
</div>
</div>
</div>
</div>
<div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex gap-4 group hover:border-yellow-200 transition-colors">
<div class="flex flex-col items-center justify-center w-12 shrink-0 bg-gray-50 group-hover:bg-yellow-50/50 rounded-xl h-full py-3 border border-gray-100 transition-colors">
<span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thu</span>
<span class="text-xl font-bold text-gray-900">26</span>
</div>
<div class="flex-1 space-y-4 relative py-1">
<div class="absolute left-[7px] top-3 bottom-3 w-0.5 bg-gray-100 -z-0"></div>
<div class="flex items-start gap-3 relative z-10">
<div class="w-4 h-4 rounded-full bg-yellow-100 border-[3px] border-white ring-1 ring-yellow-400 shrink-0 mt-0.5"></div>
<div>
<span class="block text-sm font-bold text-gray-900">07:30 AM</span>
<span class="text-xs text-gray-500">Pickup from Home</span>
</div>
</div>
<div class="flex items-start gap-3 relative z-10">
<div class="w-4 h-4 rounded-full bg-gray-200 border-[3px] border-white ring-1 ring-gray-300 shrink-0 mt-0.5"></div>
<div>
<span class="block text-sm font-bold text-gray-900">03:30 PM</span>
<span class="text-xs text-gray-500">Drop-off at Home</span>
</div>
</div>
</div>
</div>
</div>
<div class="text-center mt-4 pb-4">
<button class="text-xs font-semibold text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mx-auto w-fit">
                    View Full Month <span class="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</main>
<nav class="bg-white border-t border-gray-100 flex justify-between items-start px-2 py-3 pb-8 z-50 w-full shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
<a class="flex-1 flex flex-col items-center gap-1 group w-16 text-gray-400 hover:text-yellow-600 transition-colors" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">home</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Home</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">map</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Map</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group w-16 text-yellow-600" href="#">
<span class="material-symbols-outlined text-[26px]" style="font-variation-settings: 'FILL' 1;">calendar_month</span>
<span class="text-[10px] font-bold leading-none text-center mt-0.5">Schedule</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">feedback</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Feedback</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">person</span>
<span class="text-[10px] font-medium leading-none mt-0.5 group-hover:text-gray-600">Profile</span>
</a>
</nav>
</div>

</body></html>

<!-- Admin Dashboard Home, variant 1 of 3 -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Parent Dashboard - SafeRoute</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            yellow: '#F59E0B', 
                            dark: '#111827',
                            gray: '#F3F4F6',
                        }
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }.no-scrollbar::-webkit-scrollbar {
            display: none;
        }.no-scrollbar {
            -ms-overflow-style: none;scrollbar-width: none;}
    </style>
<style>
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-gray-100 h-screen w-full flex justify-center items-center overflow-hidden">
<div class="w-full h-full max-w-md bg-gray-50 relative flex flex-col shadow-2xl overflow-hidden">
<div class="bg-white w-full h-12 flex justify-between items-end px-6 pb-2 text-xs font-medium text-gray-900 z-50">
<span>9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[16px]">wifi</span>
<span class="material-symbols-outlined text-[16px]">battery_full</span>
</div>
</div>
<header class="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
<div class="flex items-center gap-4">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-600 transition-colors group">
<span class="material-symbols-outlined text-2xl group-hover:text-yellow-600">menu</span>
</button>
<div>
<h1 class="font-bold text-lg leading-none text-gray-900">SafeRoute</h1>
<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Parent Portal</p>
</div>
</div>
<button class="relative p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full border border-white"></span>
</button>
</header>
<main class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-6 bg-gray-50">
<div class="flex justify-between items-end">
<div>
<p class="text-sm text-gray-500">Good afternoon,</p>
<h2 class="text-2xl font-bold text-gray-900">Mrs Safdr</h2>
</div>
<div class="bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
<span class="text-xs font-bold text-yellow-800">Live Tracking</span>
</div>
</div>
<section class="grid grid-cols-2 gap-4">
<div class="bg-yellow-400 p-5 rounded-2xl shadow-lg shadow-yellow-400/20 text-gray-900 flex flex-col justify-between h-44 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
<div class="absolute -right-4 -top-4 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-300">
<span class="material-symbols-outlined text-[100px]">directions_bus</span>
</div>
<div class="z-10 relative">
<div class="bg-white/30 backdrop-blur-md w-fit p-1.5 rounded-lg mb-3">
<span class="material-symbols-outlined text-gray-900 text-xl">schedule</span>
</div>
<span class="text-xs font-bold uppercase tracking-wide opacity-80">Estimated Arrival</span>
<span class="block text-4xl font-extrabold tracking-tight mt-1">14<span class="text-xl align-top ml-1 font-bold">min</span></span>
</div>
<div class="z-10 relative flex items-center gap-2 mt-2">
<span class="text-xs font-bold bg-white/20 px-2 py-1 rounded">Bus #42</span>
<span class="text-xs font-medium opacity-80">to Home</span>
</div>
</div>
<div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-gray-800 flex flex-col justify-between h-44 group hover:border-yellow-400 transition-colors cursor-pointer">
<div class="flex justify-between items-start">
<div class="w-12 h-12 rounded-full bg-blue-50 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
<span class="material-symbols-outlined text-blue-500 text-2xl">face</span>
</div>
<span class="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Safe</span>
</div>
<div>
<span class="block text-lg font-bold text-gray-900 leading-tight">Amna</span>
<div class="flex items-center gap-1.5 mt-2 text-gray-500">
<span class="material-symbols-outlined text-sm text-green-500">check_circle</span>
<span class="text-xs font-semibold">On Board</span>
</div>
<p class="text-[10px] text-gray-400 mt-0.5">Checked in 3:30 PM</p>
</div>
</div>
</section>
<section>
<div class="flex items-center justify-between mb-3">
<h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide">Quick Access</h3>
</div>
<div class="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
<button class="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-yellow-50/50 transition-colors group text-left">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-100 group-hover:text-yellow-700 transition-colors">
<span class="material-symbols-outlined">map</span>
</div>
<div>
<span class="block text-sm font-bold text-gray-900">Live Map View</span>
<span class="block text-xs text-gray-500">Track bus location in real-time</span>
</div>
</div>
<span class="material-symbols-outlined text-gray-300 group-hover:text-yellow-500 text-xl transition-colors">chevron_right</span>
</button>
<button class="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-yellow-50/50 transition-colors group text-left">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
<span class="material-symbols-outlined">calendar_month</span>
</div>
<div>
<span class="block text-sm font-bold text-gray-900">Weekly Schedule</span>
<span class="block text-xs text-gray-500">View pick-up &amp; drop-off times</span>
</div>
</div>
<span class="material-symbols-outlined text-gray-300 group-hover:text-yellow-500 text-xl transition-colors">chevron_right</span>
</button>
<button class="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-yellow-50/50 transition-colors group text-left">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-100 transition-colors">
<span class="material-symbols-outlined">notifications_active</span>
</div>
<div>
<span class="block text-sm font-bold text-gray-900">Manage Notifications</span>
<span class="block text-xs text-gray-500">Customize alert preferences</span>
</div>
</div>
<span class="material-symbols-outlined text-gray-300 group-hover:text-yellow-500 text-xl transition-colors">chevron_right</span>
</button>
</div>
</section>
<section>
<div class="bg-gray-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
<div class="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full -mr-10 -mt-10 opacity-50"></div>
<div class="relative z-10">
<div class="flex items-center justify-between mb-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-yellow-500">campaign</span>
<h3 class="font-bold text-base">Announcement</h3>
</div>
<span class="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Today</span>
</div>
<p class="text-sm text-gray-300 leading-relaxed mb-4">
                        School will close early tomorrow at <span class="font-semibold text-white">1:00 PM</span> for staff development. Please check updated bus schedules.
                    </p>
<button class="w-full bg-white text-gray-900 font-semibold text-sm py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                        View Details
                    </button>
</div>
</div>
</section>
</main>
<nav class="bg-white border-t border-gray-100 flex justify-between items-start px-2 py-3 pb-8 z-50 w-full shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
<a class="flex-1 flex flex-col items-center gap-1 group w-16" href="#">
<span class="material-symbols-outlined text-yellow-500 text-[26px]" style="font-variation-settings: 'FILL' 1;">home</span>
<span class="text-[10px] font-bold text-yellow-600">Home</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">map</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Map</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">calendar_month</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Schedule</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">feedback</span>
<span class="text-[10px] font-medium leading-none text-center mt-0.5 group-hover:text-gray-600">Feedback</span>
</a>
<a class="flex-1 flex flex-col items-center gap-1 group text-gray-400 hover:text-yellow-600 transition-colors w-16" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform duration-200">person</span>
<span class="text-[10px] font-medium leading-none mt-0.5 group-hover:text-gray-600">Profile</span>
</a>
</nav>
</div>
</body></html>
