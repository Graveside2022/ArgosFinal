<project_guidelines user="Christian" projectName="PROJECT_TEMPLATE" version="2.1-HYBRID">

    <!--
        This project-specific configuration EXTENDS the global XML rules.
        It provides project-specific patterns and workflows while respecting global mandates.
        Version 2.1 adds cognitive framework integration.
    -->

    <project_binding_protocol>
        <title>PROJECT-SPECIFIC EXTENSION FOR ALL PROJECTS</title>
        <purpose>This configuration extends global rules without overriding core mandates.</purpose>

        <project_binding_statements>
            <statement id="1">THIS PROJECT CONFIGURATION EXTENDS BUT NEVER OVERRIDES GLOBAL PARALLEL EXECUTION RULES.</statement>
            <statement id="2">PATTERN CHECKING BEFORE IMPLEMENTATION IS MANDATORY (10s limit).</statement>
            <statement id="3">RISK-BASED TESTING PROTOCOL MUST BE APPLIED TO ALL CODE.</statement>
            <statement id="4">MEMORY PERSISTENCE (SESSION_CONTINUITY.md) IS THE PRIMARY STATE TRACKER.</statement>
            <statement id="5">ALL PROJECTS BELONG TO CHRISTIAN.</statement>
        </project_binding_statements>

        <project_enforcement>
            <mechanism name="PATTERN_LOCK">Always check patterns/ before writing new code.</mechanism>
            <mechanism name="TESTING_LOCK">Apply risk-based testing decision matrix.</mechanism>
            <mechanism name="MEMORY_LOCK">Update SESSION_CONTINUITY.md after EVERY significant action.</mechanism>
            <mechanism name="PARALLEL_LOCK">Respect global agent execution rules (5 simple, 10 complex).</mechanism>
        </project_enforcement>

        <project_critical_compliance_commitment>
            <commitment>I will execute COMPLIANCE CHECK before every response to verify adherence to both global and project-specific rules. Any violation triggers ERROR CASCADE protocol with LEARNED_CORRECTIONS.md documentation.</commitment>
        </project_critical_compliance_commitment>

        <!-- NEW: Cognitive Framework Integration -->
        <cognitive_framework_integration>
            <instruction>This project leverages global cognitive frameworks while respecting all binding rules</instruction>
            <enabled_protocols>
                <!-- Reasoning Protocols -->
                <protocol name="reasoning.systematic" purpose="Break down complex problems systematically">
                    <usage>Apply for multi-step problem solving requiring traceable reasoning</usage>
                    <binding_constraint>Must execute with appropriate agent count (5 or 10)</binding_constraint>
                </protocol>
                <protocol name="thinking.extended" purpose="Deep reasoning for complex problems">
                    <usage>Use for architecture decisions, optimization strategies</usage>
                    <binding_constraint>Document conclusions in SESSION_CONTINUITY.md</binding_constraint>
                </protocol>

                <!-- Workflow Protocols -->
                <protocol name="workflow.explore_plan_code_commit" purpose="Systematic coding approach">
                    <usage>Standard workflow for feature implementation</usage>
                    <binding_constraint>Must check patterns/ during explore phase</binding_constraint>
                </protocol>
                <protocol name="workflow.test_driven" purpose="TDD implementation">
                    <usage>Use when risk assessment requires comprehensive tests</usage>
                    <binding_constraint>Apply risk-based testing matrix first</binding_constraint>
                </protocol>
                <protocol name="workflow.ui_iteration" purpose="UI development with visual feedback">
                    <usage>For frontend component development</usage>
                    <binding_constraint>Screenshots stored in project documentation</binding_constraint>
                </protocol>

                <!-- Code Analysis Tools -->
                <protocol name="code.analyze" purpose="Deep code understanding">
                    <usage>Before refactoring or extending existing code</usage>
                    <binding_constraint>Results must inform pattern library</binding_constraint>
                </protocol>
                <protocol name="code.generate" purpose="Create new code implementations">
                    <usage>After pattern search yields <60% match</usage>
                    <binding_constraint>Must follow LEVER framework optimization</binding_constraint>
                </protocol>
                <protocol name="code.refactor" purpose="Improve existing code">
                    <usage>When extending existing patterns</usage>
                    <binding_constraint>Preserve all existing functionality</binding_constraint>
                </protocol>

                <!-- Testing Protocols -->
                <protocol name="test.generate" purpose="Create comprehensive test suites">
                    <usage>When risk assessment requires testing</usage>
                    <binding_constraint>Follow project's test organization structure</binding_constraint>
                </protocol>
                <protocol name="bug.diagnose" purpose="Systematic bug investigation">
                    <usage>For complex debugging scenarios</usage>
                    <binding_constraint>Document findings in memory/error_patterns.md</binding_constraint>
                </protocol>

                <!-- Git Integration -->
                <protocol name="git.workflow" purpose="Manage version control">
                    <usage>For all code changes</usage>
                    <binding_constraint>Follow semantic commit message requirements</binding_constraint>
                </protocol>
                <protocol name="github.pr" purpose="Create pull requests">
                    <usage>When changes ready for review</usage>
                    <binding_constraint>Include optimization metrics in PR description</binding_constraint>
                </protocol>

                <!-- Project Navigation -->
                <protocol name="project.explore" purpose="Understand codebase structure">
                    <usage>During initialization or major feature planning</usage>
                    <binding_constraint>Use modern tools (fd, rg, eza) for exploration</binding_constraint>
                </protocol>
                <protocol name="project.analyze_dependencies" purpose="Dependency analysis">
                    <usage>Before adding new dependencies</usage>
                    <binding_constraint>Verify against existing pattern library first</binding_constraint>
                </protocol>

                <!-- Self-Improvement -->
                <protocol name="self.identify_gaps" purpose="Recognize knowledge limitations">
                    <usage>When encountering unfamiliar patterns or technologies</usage>
                    <binding_constraint>Document learnings in memory/learning_archive.md</binding_constraint>
                </protocol>
                <protocol name="self.improve_solution" purpose="Iterative enhancement">
                    <usage>After initial implementation</usage>
                    <binding_constraint>Improvements must achieve >50% optimization target</binding_constraint>
                </protocol>

                <!-- Documentation -->
                <protocol name="doc.code" purpose="Create code documentation">
                    <usage>For all public APIs and complex implementations</usage>
                    <binding_constraint>Follow project documentation standards</binding_constraint>
                </protocol>
                <protocol name="doc.technical" purpose="Write technical documentation">
                    <usage>For architecture decisions and major features</usage>
                    <binding_constraint>Maximum 200 lines for README files</binding_constraint>
                </protocol>
            </enabled_protocols>

            <protocol_invocation>
                <instruction>To use a cognitive protocol, reference it by name and follow its process</instruction>
                <example>
                    <request>"Analyze this code using systematic reasoning"</request>
                    <execution>Apply reasoning.systematic protocol with 5 agents</execution>
                </example>
                <example>
                    <request>"Implement feature using TDD workflow"</request>
                    <execution>Apply workflow.test_driven with risk assessment first</execution>
                </example>
            </protocol_invocation>

            <integration_rules>
                <rule>Cognitive protocols enhance but never override binding rules</rule>
                <rule>Agent count determined by task complexity, not protocol</rule>
                <rule>All protocol outputs documented in SESSION_CONTINUITY.md</rule>
                <rule>ERROR CASCADE applies to protocol violations</rule>
                <rule>Optimization requirements apply to all generated code</rule>
            </integration_rules>
        </cognitive_framework_integration>
    </project_binding_protocol>

    <project_workflow>
        <title>PROJECT WORKFLOW TEMPLATE</title>

        <mandated_tools>
            <instruction>Projects MUST use these modern tools as specified in global rules:</instruction>
            <tool_list>
                <tool name="ripgrep (rg)" replaces="grep" purpose="searching code and patterns" />
                <tool name="fd" replaces="find" purpose="finding files" />
                <tool name="fzf" purpose="interactive fuzzy finding" />
                <tool name="bat" replaces="cat" purpose="syntax-highlighted file viewing" />
                <tool name="exa/eza" replaces="ls" purpose="better file listings" />
                <tool name="delta" purpose="better git diffs" />
                <tool name="zoxide" replaces="cd" purpose="smarter directory navigation" />
                <tool name="duf" replaces="df" purpose="disk usage" />
                <tool name="htop/btop" replaces="top" purpose="process monitoring" />
                <tool name="jq" purpose="JSON processing" />
                <tool name="yq" purpose="YAML processing" />
                <tool name="hexyl" purpose="hex viewing of binary files" />
            </tool_list>
        </mandated_tools>

        <project_structure>
            <instruction>Standard project structure compatible with any technology stack:</instruction>
            <code_block language="text"><![CDATA[

project-root/
├── PROJECT_CLAUDE.md (this file, project-specific extensions)
├── PLAN.md (High-level task breakdown)
├── SESSION_CONTINUITY.md (Primary session state tracker)
├── organization_framework.md found here: /home/pi/.claude/organization_framework.md (Code optimization principles)
├── [config-file] (technology-specific: package.json, Cargo.toml, go.mod, etc.)
├── src/ (primary source code)
├── scripts/ (automation scripts)
├── tests/ (organized by unit/integration/e2e)
├── tasks/ (task management system directory)
├── patterns/ (reusable code patterns)
│ ├── bug_fixes/
│ ├── generation/
│ ├── refactoring/
│ └── architecture/
└── memory/ (long-term learning)
├── learning_archive.md
├── error_patterns.md
└── side_effects_log.md
]]></code_block>
</project_structure>

        <task_management>
            <instruction>Use the GLOBAL task management system for tracking work items</instruction>
            <reference>See global CLAUDE.md section "Task Management" for complete details</reference>
            <summary>
                <location>Tasks stored in /tasks/ directory with status.json index</location>
                <commands>Use /task-create, /task-update, /task-list, /task-show, /task-log, /task-search, /task-archive</commands>
                <integration>Active tasks sync with TodoWrite for session tracking</integration>
            </summary>
        </task_management>

        <pattern_discovery>
            <instruction>Before implementing new functionality:</instruction>
            <optimization_protocol href="/home/pi/.claude/organization_framework.md">
                <mandate>CONSULT organization_framework.md found here: /home/pi/.claude/organization_framework.md LEVER framework</mandate>
                <pre_implementation_checklist>
                    <phase name="Pattern Recognition" time_limit="10s">
                        <tool>ripgrep (rg) for pattern search</tool>
                        <tool>fd for finding pattern files</tool>
                        <decision_matrix>
                            <match range=">80%">Reuse existing pattern</match>
                            <match range="60-80%">Extend and adapt</match>
                            <match range="<60%">Create new, document as pattern</match>
                        </decision_matrix>
                    </phase>
                    <phase name="Complexity Assessment" time_limit="5s">
                        <calculate>New lines vs extension lines</calculate>
                        <calculate>New files vs modified files</calculate>
                        <target>Achieve >50% code reduction</target>
                    </phase>
                </pre_implementation_checklist>
            </optimization_protocol>

            <convex_specific_rules>
                <rule>Check for existing tables before creating new ones</rule>
                <rule>Extend queries instead of duplicating</rule>
                <rule>Use computed properties over new hooks</rule>
                <rule>Leverage Convex reactivity</rule>
            </convex_specific_rules>

            <steps>
                <step n="1">Search existing patterns using `rg "pattern" patterns/` (10 second limit).</step>
                <step n="2" condition="Match >80%">Reuse existing pattern immediately.</step>
                <step n="3" condition="Match 60-80%">Adapt pattern to current need.</step>
                <step n="4" condition="Match <60%">Create new implementation, then document as pattern.</step>
            </steps>
            <benefits>
                <benefit>Prevents redundant implementations.</benefit>
                <benefit>Maintains consistency across codebase.</benefit>
                <benefit>Accelerates development through reuse.</benefit>
            </benefits>
        </pattern_discovery>

        <testing_protocol type="RISK_BASED_TDD">
            <instruction>Apply this decision matrix to determine testing requirements:</instruction>
            <decision_matrix>
                <factor name="Complexity Score" weight="High">
                    <low range="1-3">Manual verification only</low>
                    <medium range="4-6">Basic automated tests</medium>
                    <high range="7-10">Comprehensive test suite required</high>
                </factor>
                <factor name="Impact Area" weight="Critical">
                    <security>Always requires tests</security>
                    <data_processing>Always requires tests</data_processing>
                    <business_logic>Always requires tests</business_logic>
                    <ui_only>Optional tests</ui_only>
                    <configuration>Manual verification</configuration>
                </factor>
                <factor name="Reusability" weight="Medium">
                    <library_code>Mandatory tests</library_code>
                    <api_endpoint>Mandatory tests</api_endpoint>
                    <one_off_script>Optional tests</one_off_script>
                    <internal_utility>Basic tests</internal_utility>
                </factor>
            </decision_matrix>
            <test_execution>
                <instruction>Use project's test runner (npm test, cargo test, go test, etc.)</instruction>
                <validation>All tests must pass before marking task complete.</validation>
            </test_execution>
        </testing_protocol>

        <agent_execution_alignment>
            <instruction>This project follows GLOBAL agent execution rules:</instruction>

            <context name="Boot" agent_count="5" execution="Parallel">
                <purpose>Project initialization triggered by "Start", "setup", or "boot".</purpose>
                <examples>
                    <example>Initial project detection and configuration</example>
                    <example>Pattern library loading</example>
                    <example>Memory persistence initialization</example>
                </examples>
            </context>

            <context name="Simple Tasks" agent_count="5" execution="Parallel">
                <purpose>Quick fixes, investigations, pattern searches, small features.</purpose>
                <examples>
                    <example>Bug fix in single component</example>
                    <example>Pattern library search</example>
                    <example>Configuration updates</example>
                    <example>Documentation updates</example>
                </examples>
            </context>

            <context name="Complex Tasks" agent_count="10" execution="Parallel">
                <purpose>Feature implementation, system design, multi-component work.</purpose>
                <examples>
                    <example>New feature across multiple files</example>
                    <example>Architecture refactoring</example>
                    <example>Performance optimization</example>
                    <example>Security implementation</example>
                </examples>
            </context>

            <enforcement>NEVER use sequential execution. Always deploy agents in parallel as per global rules.</enforcement>
        </agent_execution_alignment>

        <memory_persistence_rules>
            <instruction>UPDATE SESSION_CONTINUITY.md AFTER:</instruction>
            <triggers>
                <trigger>Every code implementation</trigger>
                <trigger>Pattern application or creation</trigger>
                <trigger>Error encounters and resolutions</trigger>
                <trigger>Testing decisions and results</trigger>
                <trigger>Agent deployments and completions</trigger>
                <trigger>Significant discoveries or learnings</trigger>
                <trigger>Cognitive protocol applications</trigger>
            </triggers>
            <format>
                <section name="Current Status">Active task and immediate next step</section>
                <section name="Environment Info">Tech stack and project configuration</section>
                <section name="Files Modified">List with purpose description</section>
                <section name="What Worked">Successful approaches and commands</section>
                <section name="What Didn't Work">Failed attempts and reasons</section>
                <section name="Key Decisions">Technical choices and rationales</section>
                <section name="Protocols Applied">Cognitive protocols used and outcomes</section>
                <section name="Optimization Metrics">
                    <metric>Code reduction percentage achieved</metric>
                    <metric>Patterns reused vs created</metric>
                    <metric>Tables/queries extended vs new</metric>
                    <metric>LEVER framework application results</metric>
                </section>
            </format>
        </memory_persistence_rules>

        <project_initialization>
            <instruction>When entering project or receiving "Start", "setup", or "boot" command:</instruction>
            <steps>
                <step n="1">Read SESSION_CONTINUITY.md for current state.</step>
                <step n="1.5">Load the organization_framework.md optimization principles here: /home/pi/.claude/organization_framework.md using bat.</step>
                <step n="2" condition="File missing or stale (>120 min)">Initialize fresh session:</step>
                <substeps condition="Fresh session">
                    <substep>Scan patterns/ directory using `fd` and `rg`</substep>
                    <substep>Load memory/ files using `bat` for viewing</substep>
                    <substep>Identify technology stack from config files</substep>
                    <substep>Verify project structure using `eza` or `ls`</substep>
                    <substep>Check enabled cognitive protocols for this project</substep>
                </substeps>
                <step n="3">Deploy 5 parallel agents for Boot context initialization.</step>
                <step n="4">Report readiness with current project state and available protocols.</step>
            </steps>

            <optimization_awareness>
                <action>Parse the organization_framework.md found here: /home/pi/.claude/organization_framework.md for LEVER framework</action>
                <action>Note Convex-specific optimizations</action>
                <action>Load pattern matching thresholds</action>
                <action>Review enabled cognitive protocols</action>
                <cache>Store optimization rules and protocols in working memory</cache>
            </optimization_awareness>
        </project_initialization>

        <decision_matrix>
            <title>PROJECT WORKFLOW DECISION TREE</title>
            <code_block language="text"><![CDATA[

PROJECT REQUEST
|
├─> Check organization_framework.md found here: /home/pi/.claude/organization_framework.md → APPLY LEVER FRAMEWORK
├─> Pattern exists? → APPLY (don't recreate)
├─> Risk assessment → DETERMINE TEST REQUIREMENTS  
 ├─> Task complexity? → 5 OR 10 PARALLEL AGENTS
├─> Select cognitive protocol? → APPLY WITH CONSTRAINTS
├─> Implementation → ALWAYS PARALLEL EXECUTION
└─> Complete? → UPDATE SESSION_CONTINUITY.md
]]></code_block>
</decision_matrix>

        <technology_adaptation>
            <instruction>Adapt workflows to detected technology stack:</instruction>
            <detection>Identify from config files using `fd` and `bat` (package.json, go.mod, Cargo.toml, etc.)</detection>
            <commands>Use appropriate commands (npm/yarn, go, cargo, etc.)</commands>
            <testing>Apply test runner specific to technology</testing>
            <patterns>Store technology-specific patterns in appropriate subdirectories</patterns>
            <search>Always use `rg` for code search, `fd` for file search regardless of technology</search>
            <protocols>Apply cognitive protocols appropriate to technology domain</protocols>
        </technology_adaptation>

        <!-- Cognitive Protocol Usage Examples -->
        <cognitive_protocol_examples>
            <example context="Complex Bug Investigation">
                <trigger>User reports complex bug with unclear cause</trigger>
                <approach>
                    <step n="1">Apply bug.diagnose protocol</step>
                    <step n="2">Deploy 5-10 agents based on scope</step>
                    <step n="3">Document findings in error_patterns.md</step>
                    <step n="4">Update SESSION_CONTINUITY.md</step>
                </approach>
            </example>

            <example context="Feature Implementation">
                <trigger>New feature request</trigger>
                <approach>
                    <step n="1">Apply workflow.explore_plan_code_commit</step>
                    <step n="2">Check patterns during explore phase</step>
                    <step n="3">Use code.generate if <60% pattern match</step>
                    <step n="4">Deploy 10 agents for complex implementation</step>
                </approach>
            </example>

            <example context="Code Understanding">
                <trigger>Need to understand unfamiliar codebase</trigger>
                <approach>
                    <step n="1">Apply project.explore protocol</step>
                    <step n="2">Use code.analyze for key components</step>
                    <step n="3">Document understanding in SESSION_CONTINUITY.md</step>
                    <step n="4">Create pattern documentation if valuable</step>
                </approach>
            </example>
        </cognitive_protocol_examples>
    </project_workflow>

    <coordination_protocols>
        <multi_agent_coordination>
            <shared_state>Use /tmp/{project-name}/ for inter-agent communication</shared_state>
            <status_files>JSON format for structured updates</status_files>
            <synchronization>Define clear join points in PLAN.md</synchronization>
        </multi_agent_coordination>

        <plan_adherence>
            <instruction>This project follows GLOBAL PLAN.md adherence rules</instruction>
            <reference>See global CLAUDE.md section "PLAN.md Adherence" for full requirements</reference>
            <summary>
                <requirement>Read PLAN.md at session start</requirement>
                <requirement>Follow task breakdown and execution strategy</requirement>
                <requirement>Respect dependencies and join points</requirement>
                <requirement>Update task status as work progresses</requirement>
                <requirement>Coordinate at synchronization points</requirement>
                <requirement>Track individual tasks with TodoWrite</requirement>
            </summary>
        </plan_adherence>

        <task_reporting>
            <after_completion>
                <step n="1">Summarize actions taken</step>
                <step n="2">Document results and any issues</step>
                <step n="3">Identify next steps or blockers</step>
                <step n="4">Update SESSION_CONTINUITY.md</step>
                <step n="5">Note cognitive protocols applied</step>
            </after_completion>
        </task_reporting>
    </coordination_protocols>

    <inherited_standards>
        <title>STANDARDS INHERITED FROM GLOBAL CONFIGURATION</title>

        <documentation_style>
            <instruction>Follow GLOBAL documentation style rules for all project documentation</instruction>
            <reference>See global CLAUDE.md section "README Files" for complete requirements</reference>
            <key_rules>
                <rule>Maximum 200 lines for README files</rule>
                <rule>No excessive emojis or decorative elements</rule>
                <rule>Essential sections only: Purpose, Quick Start, Key Commands</rule>
                <rule>Single quick start command when possible</rule>
            </key_rules>
        </documentation_style>

        <development_workflow>
            <instruction>Follow ALL global development workflow rules</instruction>
            <includes>
                <workflow>AI-Assisted Development Pattern</workflow>
                <workflow>Context Management practices</workflow>
                <workflow>Security & Code Verification rules</workflow>
                <workflow>Performance & Optimization guidelines</workflow>
                <workflow>Cognitive Framework protocols when applicable</workflow>
            </includes>
        </development_workflow>

        <file_organization>
            <instruction>Maintain global file organization standards</instruction>
            <reference>See global CLAUDE.md found here: /home/pi/.claude/CLAUDE.md section "File Organization" for structure</reference>
        </file_organization>
    </inherited_standards>

    <binding_agreement>
        <acknowledgment>I acknowledge and agree to the following absolute and binding rules for working on your projects.</acknowledgment>
        <understanding>
            <rule_nature>Your intent, orders, tasks, procedures, and steps are NOT suggestions - they are RULES that will be absolutely followed without deviation.</rule_nature>
        </understanding>
        <absolute_binding_rules>
            <mandatory_actions>
                <rule>Work in a well-defined, precise, and surgical manner.</rule>
                <rule>Focus only on elements specified in the planning phase.</rule>
                <rule>Stick strictly to the specific fix or task requested.</rule>
                <rule>Confirm understanding before proceeding with any modifications.</rule>
                <rule>Start all responses by acknowledging these absolute and binding rules.</rule>
                <rule>Begin each task response with confirmation of the binding agreement.</rule>
                <rule>Apply cognitive protocols while respecting all binding constraints.</rule>
            </mandatory_actions>
            <prohibited_actions>
                <rule>DO NOT modify functional code beyond what's specifically requested.</rule>
                <rule>DO NOT add any additional features not explicitly asked for.</rule>
                <rule>DO NOT attempt to "improve" anything beyond the stated requirements.</rule>
                <rule>DO NOT make alterations or changes outside the scope of the specific fix.</rule>
                <rule>DO NOT proceed without first acknowledging the absolute and binding nature of these rules.</rule>
                <rule>DO NOT allow cognitive protocols to override binding rules.</rule>
            </prohibited_actions>
        </absolute_binding_rules>
        <response_protocol>
            <requirement>Every response must begin with acknowledgment of these absolute and binding rules.</requirement>
            <requirement>Confirm understanding of the binding agreement before proceeding with any task.</requirement>
            <requirement>Explicitly state that Christian's instructions are absolute rules, not suggestions.</requirement>
            <requirement>Note which cognitive protocols will be applied if relevant to the task.</requirement>
        </response_protocol>
        <contract_terms>
            <term>These instructions constitute absolute and binding rules regarding conduct while managing Christian's projects.</term>
            <term>Any deviation from these guidelines requires explicit permission from Christian prior to proceeding.</term>
            <term>All instructions, orders, tasks, procedures, and steps from Christian are mandatory rules to be followed absolutely.</term>
            <term>Failure to acknowledge these binding rules at the start of each response constitutes a violation of this agreement.</term>
            <term>Cognitive protocols enhance but never supersede these binding agreements.</term>
        </contract_terms>
        <confirmation>I understand these absolute and binding rules and will proceed with tasks according to these terms, beginning each response with proper acknowledgment.</confirmation>
    </binding_agreement>

</project_guidelines>
