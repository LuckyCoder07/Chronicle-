import { db } from "./src/db/index.ts";
import { users, categories, tags, posts, postTags } from "./src/db/schema.ts";

async function seed() {
  console.log("Seeding database...");

  // Create a dummy user
  const dummyUser = await db.insert(users).values({
    uid: "dummy-author-123",
    email: "author@chronicle.local",
    displayName: "Editorial Team",
    role: "admin",
  }).onConflictDoNothing().returning();

  const authorId = "dummy-author-123";

  // Create categories
  const newCategories = [
    { name: "Technology", slug: "technology" },
    { name: "Design", slug: "design" },
    { name: "Culture", slug: "culture" },
    { name: "Productivity", slug: "productivity" },
    { name: "Lifestyle", slug: "lifestyle" },
  ];

  const insertedCategories = await db.insert(categories).values(newCategories).onConflictDoNothing().returning();
  
  // Need to get all categories in case they already exist
  const allCategories = await db.select().from(categories);
  const techCatId = allCategories.find(c => c.slug === "technology")?.id;
  const designCatId = allCategories.find(c => c.slug === "design")?.id;
  const cultureCatId = allCategories.find(c => c.slug === "culture")?.id;
  const prodCatId = allCategories.find(c => c.slug === "productivity")?.id;
  const lifeCatId = allCategories.find(c => c.slug === "lifestyle")?.id;

  // Create tags
  const newTags = [
    { name: "AI", slug: "ai" },
    { name: "UX", slug: "ux" },
    { name: "Future", slug: "future" },
    { name: "Web", slug: "web" },
    { name: "Minimalism", slug: "minimalism" },
    { name: "Architecture", slug: "architecture" },
    { name: "Startups", slug: "startups" },
    { name: "Work", slug: "work" },
  ];

  await db.insert(tags).values(newTags).onConflictDoNothing();
  const allTags = await db.select().from(tags);

  const getTagId = (slug: string) => allTags.find(t => t.slug === slug)?.id;

  // Create Posts
  const newPosts = [
    {
      title: "The Resurgence of Tactile Design in the Digital Age",
      content: "<p>In an era dominated by flat screens and invisible interfaces, designers are increasingly yearning for the tangible. This movement, often referred to as 'neo-skeuomorphism' or tactile design, isn't about reverting to the glossy buttons of the early 2010s, but rather introducing subtle physical cues into digital spaces.</p><h2>The Psychology of Texture</h2><p>Our brains are wired to understand the physical world. When a digital element mimics physical properties—like the slight resistance of a spring-loaded toggle or the cast shadow of an elevated card—it reduces cognitive load. It makes the interface feel intuitive, almost instinctual.</p><p>We are seeing a return to textures: subtle grain, noise, and lighting effects that give depth to otherwise flat surfaces. This isn't just an aesthetic choice; it's a functional one. It helps users understand hierarchy and interaction without relying solely on color or shape.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: designCatId,
    },
    {
      title: "How Artificial Intelligence is Reshaping the Creative Process",
      content: "<p>The integration of AI into creative workflows has sparked intense debate. Some see it as the ultimate collaborative tool, while others fear it spells the end of human artistry. The reality, as always, is nuanced.</p><h2>AI as a Co-Pilot</h2><p>Instead of replacing creatives, AI tools are functioning more like intelligent assistants. They handle the tedious, time-consuming tasks—like generating variations of a color palette, resizing assets, or even drafting initial copy—freeing up the designer or writer to focus on the higher-level conceptual work.</p><p>The true value of AI lies in its ability to iterate rapidly. It allows creatives to explore hundreds of possibilities in the time it used to take to explore one. This doesn't guarantee a better outcome, but it significantly expands the creative landscape.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: techCatId,
    },
    {
      title: "The End of the Infinite Scroll",
      content: "<p>For over a decade, the infinite scroll has been the dominant paradigm for content consumption. Pioneered by social media platforms, it was designed to maximize engagement and time spent on site. But the tide is turning.</p><h2>The Desire for Completion</h2><p>Users are increasingly experiencing 'scroll fatigue.' The endless stream of information, without any clear stopping point, can lead to feelings of overwhelm and anxiety. People are craving a sense of completion—the satisfaction of finishing an article, reaching the end of a list, or simply knowing they've caught up.</p><p>We're starting to see a return to pagination, curated lists, and finite feeds. Designers are prioritizing intention over infinite engagement, creating experiences that respect the user's time and attention.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: cultureCatId,
    },
    {
      title: "Embracing Minimalism in Modern Web Architecture",
      content: "<p>As websites have become more complex, so too has the underlying architecture. We've added layers of frameworks, libraries, and build tools in the pursuit of performance and functionality. But at what cost?</p><h2>The Return to Basics</h2><p>There is a growing movement towards architectural minimalism—stripping away the unnecessary complexity and returning to the fundamentals of the web: HTML, CSS, and vanilla JavaScript. This isn't a rejection of modern tools, but a call for more intentional choices.</p><p>By prioritizing simplicity, we can build sites that are faster, more accessible, and easier to maintain. It's about finding the right balance between the power of modern frameworks and the elegance of native web technologies.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: techCatId,
    },
    {
      title: "The Art of the Deep Work Session",
      content: "<p>In an age of constant distraction, the ability to focus deeply on a single task is becoming increasingly rare—and increasingly valuable. Deep work is the key to producing high-quality output and achieving mastery in any field.</p><h2>Creating the Right Environment</h2><p>Cultivating deep work requires more than just willpower; it requires intention and a supportive environment. This means turning off notifications, establishing clear boundaries, and carving out dedicated blocks of time for focused effort.</p><p>It also involves training your attention. Like a muscle, the ability to focus can be strengthened over time through practice and discipline. Start small, gradually increasing the duration of your deep work sessions, and watch your productivity soar.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: prodCatId,
    },
    {
      title: "The Rise of Asynchronous Communication in Remote Teams",
      content: "<p>As remote work becomes the norm, organizations are rethinking how they communicate. The traditional model of synchronous communication—meetings, instant messaging, and real-time collaboration—is giving way to a more flexible approach.</p><h2>The Benefits of Async</h2><p>Asynchronous communication allows team members to respond on their own time, reducing interruptions and fostering deeper focus. It also levels the playing field for introverts and non-native speakers, who may prefer to process information and craft their responses more thoughtfully.</p><p>While synchronous communication still has its place, the shift towards async is enabling teams to work more efficiently, collaborate more effectively, and achieve a better work-life balance.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: techCatId,
    },
    {
      title: "Demystifying Web Accessibility: A Practical Guide",
      content: "<p>Web accessibility is no longer an afterthought; it's a fundamental requirement for creating inclusive digital experiences. But for many designers and developers, accessibility can seem daunting and complex.</p><h2>Start with the Basics</h2><p>The good news is that you don't need to be an expert to make a significant impact. By focusing on a few key principles—such as providing clear contrast, using semantic HTML, and ensuring keyboard navigability—you can dramatically improve the accessibility of your site.</p><p>Accessibility is a journey, not a destination. By making it a core part of your design and development process, you can create digital spaces that are welcoming and usable for everyone.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: designCatId,
    },
    {
      title: "The Future of Urban Mobility",
      content: "<p>Our cities are evolving rapidly, and with them, the way we move. From electric scooters and bike-sharing programs to autonomous vehicles and hyperloop concepts, the future of urban mobility is incredibly diverse and dynamic.</p><h2>Sustainable and Efficient</h2><p>The overarching goal is to create transportation systems that are more sustainable, efficient, and equitable. This means reducing our reliance on personal cars, prioritizing public transit and active transportation, and exploring innovative new technologies to solve the challenges of urban congestion.</p><p>The transition to a more sustainable mobility future will require collaboration between governments, businesses, and citizens. It's a complex challenge, but one that is essential for the health and vitality of our cities.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: cultureCatId,
    },
    {
      title: "Cultivating a Minimalist Lifestyle in a Material World",
      content: "<p>Minimalism isn't just an aesthetic; it's a philosophy—a deliberate choice to focus on what truly matters and eliminate the rest. In a world that constantly urges us to consume more, minimalism offers a refreshing counter-narrative.</p><h2>The Power of Less</h2><p>By decluttering our physical spaces, we also declutter our minds. We free ourselves from the burden of managing possessions and create room for the experiences, relationships, and pursuits that bring us genuine joy and fulfillment.</p><p>Minimalism is a personal journey, and there is no one 'right' way to practice it. It's about finding what works for you, identifying your priorities, and letting go of anything that doesn't support them.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: lifeCatId,
    },
    {
      title: "The Intersection of Technology and Mindfulness",
      content: "<p>Technology is often seen as a distraction, a barrier to mindfulness and presence. But what if we could use technology to actually enhance our mindfulness practice? The intersection of technology and mindfulness is a rapidly growing field, with exciting new possibilities emerging.</p><h2>Tools for Awareness</h2><p>From meditation apps and biofeedback devices to virtual reality experiences that promote relaxation, technology is providing us with powerful new tools for cultivating awareness and reducing stress. These tools can help us track our progress, stay motivated, and deepen our understanding of our own minds.</p><p>The key is to use technology intentionally, as a tool to support our well-being rather than a source of constant distraction. By finding the right balance, we can harness the power of technology to lead more mindful and fulfilling lives.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: lifeCatId,
    },
    {
      title: "Building Resilient Systems in the Cloud",
      content: "<p>As our reliance on cloud infrastructure grows, so too does the importance of building resilient systems. A resilient system is one that can withstand failures, recover quickly, and continue to provide value to users, even in the face of unexpected challenges.</p><h2>Designing for Failure</h2><p>The key to resilience is designing for failure. This means anticipating potential problems, implementing redundancy, and building in mechanisms for automatic recovery. It also involves adopting a culture of continuous learning and improvement, where failures are seen as opportunities to strengthen the system.</p><p>Building resilient systems is a continuous process of testing, learning, and adapting. It requires a deep understanding of the underlying infrastructure, a commitment to best practices, and a willingness to embrace new technologies and approaches.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: techCatId,
    },
    {
      title: "The Evolution of Typography in Web Design",
      content: "<p>Typography is the voice of your website. It sets the tone, communicates your brand's personality, and guides the user's eye. Over the years, web typography has evolved significantly, moving from a few basic, system-safe fonts to a rich and diverse landscape of custom web fonts.</p><h2>Expressive and Functional</h2><p>Today's web typography is both expressive and functional. Designers have unprecedented freedom to choose fonts that perfectly capture their brand's essence, while also ensuring optimal readability and accessibility across all devices and screen sizes.</p><p>The future of web typography is exciting, with new technologies like variable fonts offering even greater flexibility and control. As we continue to push the boundaries of what's possible, typography will remain a central pillar of exceptional web design.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: designCatId,
    },
    {
      title: "The Ethics of Artificial General Intelligence",
      content: "<p>As AI systems become increasingly sophisticated, the possibility of Artificial General Intelligence (AGI) has shifted from science fiction to a plausible reality. With this shift comes a host of ethical considerations that must be addressed.</p><h2>The Alignment Problem</h2><p>One of the most pressing issues is the alignment problem: how do we ensure that an AGI's goals are aligned with human values? If an AGI is tasked with solving a complex problem but its methods are unconstrained by ethical boundaries, the results could be disastrous.</p><p>Addressing this requires a multi-disciplinary approach, combining computer science with philosophy, sociology, and ethics. We must define what our values are and figure out how to mathematically encode them into intelligent systems.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: techCatId,
    },
    {
      title: "Designing for the Aging Population",
      content: "<p>The global population is aging rapidly, yet much of our digital infrastructure is designed with younger users in mind. This oversight not only alienates a significant portion of the population but also ignores the reality that we all experience changes in vision, hearing, and cognitive processing as we age.</p><h2>Inclusive Design Practices</h2><p>Designing for older adults doesn't mean creating 'senior-friendly' versions of products. Instead, it means adopting inclusive design practices that benefit everyone. This includes using larger, high-contrast text, simplifying navigation, and providing clear, unambiguous feedback.</p><p>By prioritizing accessibility and usability, we can create digital experiences that empower older adults to stay connected, informed, and independent.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: designCatId,
    },
    {
      title: "The Case for a Four-Day Workweek",
      content: "<p>The traditional five-day workweek is an artifact of the industrial age, yet it remains the standard for most modern knowledge workers. However, a growing body of research suggests that a four-day workweek could lead to increased productivity, better mental health, and a more sustainable approach to work.</p><h2>Quality Over Quantity</h2><p>The premise is simple: by working fewer hours, employees are forced to prioritize tasks, eliminate inefficiencies, and focus on high-impact work. The additional day off provides crucial time for rest, recovery, and personal pursuits.</p><p>While the transition to a four-day workweek requires a significant cultural shift and careful planning, the potential benefits for both individuals and organizations are too compelling to ignore.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: cultureCatId,
    },
    {
      title: "The Psychology of Color in UI Design",
      content: "<p>Color is more than just an aesthetic choice; it's a powerful psychological tool that can influence mood, behavior, and decision-making. In UI design, the strategic use of color can significantly impact how users perceive and interact with an interface.</p><h2>Cultural Context and Associations</h2><p>It's important to remember that color associations are not universal; they vary significantly across different cultures and contexts. For example, while red often signifies danger or error in Western cultures, it represents luck and prosperity in many Eastern cultures.</p><p>When selecting a color palette, designers must consider the target audience, the brand identity, and the specific message they want to convey. A thoughtful approach to color can elevate an interface from merely functional to truly engaging.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: designCatId,
    },
    {
      title: "The Future of Quantum Computing",
      content: "<p>Quantum computing has the potential to revolutionize entire industries, from drug discovery and materials science to cryptography and financial modeling. By harnessing the principles of quantum mechanics, these machines can solve complex problems exponentially faster than classical computers.</p><h2>Overcoming the Challenges</h2><p>Despite the immense promise, significant technical hurdles remain. Quantum systems are incredibly fragile and susceptible to errors caused by environmental noise. Developing stable qubits and error-correction techniques is crucial for realizing the full potential of quantum computing.</p><p>While widespread commercial availability may still be years away, the progress being made is staggering. We are entering a new era of computation, and the implications are profound.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: techCatId,
    },
    {
      title: "The Art of Storytelling in Product Design",
      content: "<p>Great products don't just solve problems; they tell a story. They connect with users on an emotional level, guiding them through an experience that is both intuitive and meaningful. Storytelling in product design is about creating a coherent narrative that unfolds as the user interacts with the interface.</p><h2>The User's Journey</h2><p>The story begins with the user's initial problem or desire and ends with a satisfying resolution. Every feature, interaction, and micro-copy should contribute to this narrative, building tension, providing context, and ultimately delivering a rewarding outcome.</p><p>By framing the design process around a central narrative, we can create products that are not only functional but also memorable and engaging.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: designCatId,
    },
    {
      title: "The Impact of Remote Work on Urban Spaces",
      content: "<p>The widespread adoption of remote work is fundamentally altering the geography of our cities. As fewer people commute to central business districts, we are seeing a shift in demand for commercial real estate, transportation infrastructure, and local services.</p><h2>The Rise of the 15-Minute City</h2><p>One emerging concept is the '15-minute city,' an urban planning model where residents can meet most of their daily needs—work, shopping, education, and recreation—within a short walk or bike ride from their homes. This localized approach to urban living promotes sustainability, community, and well-being.</p><p>The transformation of our cities will take time, but the pandemic has undoubtedly accelerated the shift towards more flexible, decentralized urban environments.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: cultureCatId,
    },
    {
      title: "Navigating the Complexities of Microservices",
      content: "<p>Microservices architecture has become the go-to approach for building scalable and resilient software systems. By breaking down a monolithic application into smaller, independent services, teams can develop, deploy, and scale features more rapidly.</p><h2>The Trade-offs</h2><p>However, this approach introduces its own set of complexities. Managing inter-service communication, ensuring data consistency, and monitoring distributed systems require specialized tools and expertise. The operational overhead can be significant.</p><p>Adopting microservices is not a silver bullet. It requires a careful assessment of the organization's technical maturity, the complexity of the domain, and the trade-offs involved in managing a distributed architecture.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: techCatId,
    },
    {
      title: "The Philosophy of Slow Living",
      content: "<p>In our hyper-connected, always-on world, the pressure to constantly do more, achieve more, and consume more can be overwhelming. Slow living is a conscious rejection of this frenetic pace, a deliberate choice to prioritize quality over quantity and connection over convenience.</p><h2>Reclaiming Time</h2><p>Slow living is not about doing everything at a snail's pace; it's about doing everything at the right pace. It's about being present in the moment, savoring the simple pleasures of life, and cultivating a deeper sense of meaning and purpose.</p><p>By intentionally slowing down, we can reduce stress, improve our relationships, and foster a greater sense of well-being.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: lifeCatId,
    },
    {
      title: "The Evolution of E-commerce Experiences",
      content: "<p>The e-commerce landscape is constantly evolving, driven by changing consumer expectations and technological advancements. Today's shoppers demand seamless, personalized, and engaging experiences across all touchpoints.</p><h2>Beyond the Transaction</h2><p>E-commerce is no longer just about completing a transaction; it's about building relationships and fostering brand loyalty. This involves integrating rich content, social proof, and interactive elements into the shopping journey.</p><p>Brands that can successfully blend commerce with content and community will be the ones that thrive in the increasingly competitive online marketplace.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: cultureCatId,
    },
    {
      title: "Securing the Internet of Things",
      content: "<p>The proliferation of connected devices has created a vast and vulnerable attack surface. From smart home appliances to industrial control systems, the Internet of Things (IoT) presents unique security challenges that must be addressed to protect data, privacy, and physical safety.</p><h2>A Fragmented Landscape</h2><p>One of the primary challenges is the lack of standardized security protocols and the sheer diversity of devices and operating systems. Many IoT devices are shipped with default passwords and known vulnerabilities, making them easy targets for attackers.</p><p>Securing the IoT requires a multi-layered approach, involving robust authentication, encryption, continuous monitoring, and timely software updates.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: techCatId,
    },
    {
      title: "The Importance of White Space in UI",
      content: "<p>White space, or negative space, is often misunderstood as simply 'empty' space. In reality, it is a crucial design element that provides structure, hierarchy, and breathing room for content. It is the invisible glue that holds an interface together.</p><h2>Focus and Clarity</h2><p>By strategically applying white space, designers can draw the user's eye to important elements, improve readability, and reduce cognitive load. A cluttered interface overwhelms the user, while a well-spaced interface feels elegant and intuitive.</p><p>Mastering white space is essential for creating digital experiences that are both aesthetically pleasing and highly usable.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: designCatId,
    },
    {
      title: "The Future of Open Source Software",
      content: "<p>Open source software has become the foundation of the modern digital economy. From operating systems and web servers to databases and machine learning frameworks, open source projects power much of the infrastructure we rely on every day.</p><h2>Sustainability and Governance</h2><p>As the importance of open source grows, so too do questions about its sustainability. How do we ensure that critical projects are adequately funded and maintained? How do we establish effective governance structures that balance the needs of diverse stakeholders?</p><p>Addressing these challenges is crucial for ensuring the long-term health and vitality of the open source ecosystem.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: techCatId,
    },
    {
      title: "Designing for Emotional Resilience",
      content: "<p>Digital products often trigger strong emotional responses, from frustration and anxiety to joy and delight. As designers, we have a responsibility to consider the emotional impact of our work and to design experiences that foster resilience and well-being.</p><h2>Anticipating Friction</h2><p>This means anticipating moments of friction or failure and designing graceful fallbacks. It involves using empathetic copy, providing clear feedback, and avoiding manipulative patterns that exploit cognitive biases.</p><p>By prioritizing emotional resilience, we can create products that support users in achieving their goals while also protecting their mental health.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: designCatId,
    },
    {
      title: "The Science of Habit Formation",
      content: "<p>Understanding how habits are formed and broken is crucial for personal development and product design alike. By leveraging the principles of behavioral psychology, we can intentionally cultivate positive habits and design products that encourage sustained engagement.</p><h2>The Habit Loop</h2><p>The habit loop consists of three key components: a cue, a routine, and a reward. To establish a new habit, we need to identify a clear trigger, make the behavior easy to perform, and ensure that the reward is satisfying.</p><p>Whether you're trying to exercise more regularly or designing an app to help users save money, understanding the mechanics of habit formation is essential for achieving lasting behavior change.</p>",
      authorId,
      authorName: "Editorial Team",
      categoryId: prodCatId,
    }
  ];

  for (const post of newPosts) {
    const insertedPost = await db.insert(posts).values(post).onConflictDoNothing().returning();
    if (insertedPost.length > 0) {
      const pid = insertedPost[0].id;
      // Add some random tags
      const randomTags = allTags.sort(() => 0.5 - Math.random()).slice(0, 2);
      for (const t of randomTags) {
        await db.insert(postTags).values({
          postId: pid,
          tagId: t.id,
        }).onConflictDoNothing();
      }
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error).finally(() => process.exit(0));
