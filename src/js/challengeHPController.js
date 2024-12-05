class Controller {
    
    constructor(emitter, container) {
        this.CONST = {
        }
        this.emitter = emitter
        this.container = container;
        
        
        
        this.model = {
            projects: [
                {
                    name: "React Framework",
                    lang: "Javascript",
                    stars: 230,
                    path: "github-react/",
                    repo: "https://github.com/facebook/react.git"
                },
                {
                    name: "Python AI/LLM Transformers",
                    lang: "Python",
                    stars: 136,
                    path: "github-python-ai-transformers/",
                    repo: "https://github.com/huggingface/transformers.git"
                },
                {
                    name: "The Go Programming Language",
                    lang: "Go",
                    stars: 124,
                    path: "github-go-lang/",
                    repo: "https://github.com/golang/go.git"
                },
                {
                    name: "Godot 3D Engine",
                    lang: "C++",
                    stars: 91,
                    path: "github-godot/",
                    repo: "https://github.com/godotengine/godot.git"
                },
                {
                    name: "Bitcoin",
                    lang: "C++",
                    stars: 79,
                    path: "github-bitcoin/",
                    repo: "https://github.com/bitcoin/bitcoin.git"
                },
                {
                    name: "Vue Framework 3",
                    lang: "Typescript",
                    stars: 49,
                    path: "github-vue-3/",
                    repo: "https://github.com/vuejs/core.git"
                },
                {
                    name: "Spring Framework (foundations)",
                    lang: "Java",
                    stars: 47,
                    path: "github-java-spring/",
                    repo: "https://github.com/spring-projects/spring-framework.git"
                },
                {
                    name: "Remix Full Stack Web framework",
                    lang: "Typescript",
                    stars: 30,
                    path: "github-typescript-remix/",
                    repo: "https://github.com/remix-run/remix.git"
                },
                {
                    name: "The Symfony PHP framework",
                    lang: "PHP",
                    stars: 29,
                    path: "github-php-symfony/",
                    repo: "https://github.com/symfony/symfony.git"
                }

            ],            
        }
    }

    static async getInstance(emitter, container){                       
        const a = new Controller(emitter, container)        
        return a;
    }

    
}

