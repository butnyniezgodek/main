class Todo {

    constructor() {
        this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];


        this.listEl = document.getElementById("todo-list");
        this.searchEl = document.getElementById("search");
        this.inputText = document.getElementById("task-text");
        this.inputDate = document.getElementById("task-date");
        this.addBtn = document.getElementById("add-task");

        this.addBtn.addEventListener("click", () => this.addTask());

        this.searchEl.addEventListener("input", () => this.draw());

        this.draw();
    }

    save() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    }


    validate(text, date) {
        if (text.length < 3 || text.length > 255) {
            alert("Zadanie musi mieć 3–255 znaków");
            return false;
        }
        if (date && new Date(date) <= new Date()) {
            alert("Data musi być w przyszłości");
            return false;
        }
        return true;
    }

    addTask() {
        const text = this.inputText.value.trim();
        const date = this.inputDate.value;

        if (!this.validate(text, date)) return;

        this.tasks.push({ text, date });

        this.save();

        this.draw();

        this.inputText.value = "";
        this.inputDate.value = "";
    }


    deleteTask(index) {
        this.tasks.splice(index, 1);
        this.save();
        this.draw();
    }

    editTask(index) {
        const li = this.listEl.children[index];
        const input = document.createElement("input");
        input.value = this.tasks[index].text;

        li.innerHTML = "";
        li.appendChild(input);
        input.focus();

        input.addEventListener("blur", () => {
            const newText = input.value.trim();
            if (newText.length >= 3) {
                this.tasks[index].text = newText;
                this.save();
            }
            this.draw();
        });
    }

    highlight(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, "gi");
        return text.replace(regex, `<span class="highlight">$1</span>`);
    }

    draw() {
        this.listEl.innerHTML = "";

        const query = this.searchEl.value.trim().toLowerCase();

        let visibleTasks;

        if (query.length >= 2) {
            visibleTasks = [];
            for (let i = 0; i < this.tasks.length; i++) {
                const t = this.tasks[i];
                if (t.text.toLowerCase().includes(query)) {
                    visibleTasks.push(t);
                }
            }
        } else {
            visibleTasks = this.tasks;
        }

        visibleTasks.forEach((task, index) => {
            const li = document.createElement("li");

            const dateText = task.date ? ` (do: ${new Date(task.date).toLocaleString()})` : "";

            li.innerHTML = this.highlight(task.text, query) + dateText;

            li.addEventListener("click", (e) => {
                if (e.target.tagName !== "BUTTON") {
                    this.editTask(index);
                }
            });

            const btn = document.createElement("button");
            btn.textContent = "🚮";
            btn.addEventListener("click", () => this.deleteTask(index));

            li.appendChild(btn);
            this.listEl.appendChild(li);
        });
    }
}

new Todo();
