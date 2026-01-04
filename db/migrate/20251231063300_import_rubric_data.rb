class ImportRubricData < ActiveRecord::Migration[8.1]
  class Rubric < ApplicationRecord
    self.table_name = "rubrics"
    has_many :categories
    has_many :dimensions
  end

  class Category < ApplicationRecord
    self.table_name = "categories"
    belongs_to :rubric
    has_many :dimensions
  end

  class Dimension < ApplicationRecord
    self.table_name = "dimensions"
    belongs_to :rubric
    belongs_to :category
    has_many :expectations
  end

  class JobTitle < ApplicationRecord
    self.table_name = "job_titles"
    has_many :expectations
  end

  class Expectation < ApplicationRecord
    self.table_name = "expectations"
    belongs_to :dimension
    belongs_to :job_title
  end

  def up
    # Create the Rubric
    rubric = Rubric.create!(
      name: "Engineering Competencies",
      description: "Standard terminology used in performance management, HR frameworks, and talent development globally. It refers to the observable and measurable behaviours, skills, knowledge, and abilities that are essential for success in a role.",
    )

    # Create Job Titles
    job_titles = {
      "Junior Engineer" => JobTitle.create!(name: "Junior Engineer"),
      "Intermediate Engineer" => JobTitle.create!(name: "Intermediate Engineer"),
      "Senior Engineer" => JobTitle.create!(name: "Senior Engineer"),
      "Tech Lead" => JobTitle.create!(name: "Tech Lead"),
      "Principal Engineer" => JobTitle.create!(name: "Principal Engineer"),
      "Engineer Manager" => JobTitle.create!(name: "Engineer Manager"),
    }

    # Craft and Technical Competency
    craft_category = Category.create!(
      rubric_id: rubric.id,
      name: "Craft and Technical Competency",
    )

    craft_dimensions = [
      {
        name: "Implementation",
        expectations: [
          "Writes clear, idiomatic, and unit-tested code that adheres to team conventions. Builds familiarity and confidence within a focused area of the system.",
          "Implements comprehensible solutions that extend existing architecture. Proficient in one area, familiar with others. Supports TRDs and proposes solutions to business problems. Avoids unnecessary shortcuts and minimizes tech debt.",
          "Delivers robust, scalable, and well-structured components. Familiar with all components within their squad. Expert in multiple languages. Produces high-impact, maintainable code independently.  Explains frameworks confidently. Proactively refactors and reduces tech debt with measurable outcomes. Embraces complexity and learns new domains.",
          "Deep Expert in multiple languages, frameworks, and implementation strategies.  Balances delivery speed with long-term quality. Mentors others on implementation best practices.",
          "Deep expertise across many languages, engineering theory, and system design. Leads adoption of standards and technologies that enhance development speed and product quality. Sets technical direction through influence and insight.",
          "Maintains broad technical expertise to mentor engineers across disciplines. Owns implementation practices, ensuring alignment with strategy and functional principles. Drives continuous improvement in delivery, tooling, and team capabilities.",
        ],
      },
      {
        name: "Design & Architecture",
        expectations: [
          "Follows established design patterns, conventions, and team practices. Begins to understand broader architectural concepts and system design. Eager to review TRDs and make comment when possible.",
          "Applies existing patterns appropriately. Suggests improvements and alternative designs where beneficial. Begins to draft TRDs with guidance, in familiar areas.",
          "Deeply knowledgeable in one system area with a solid grasp of others. Writes and reviews TRDs for major features. Breaks down TRDs into clear specifications. Expert at applying and evolving design patterns.",
          "Shapes and embeds architectural patterns across multiple system components. Leads TRD authoring and functional reviews. Drives architecture reviews and fosters consistency across codebases. Collaborates on long-term technical vision.",
          "Sheaphards and evolves architecture at an organizational level. Ensures long-term scalability, reliability, and innovation. Introduces and promotes architectural patterns that boost delivery speed and quality. Leads cross-functional TRD development and reviews. Advises on systemic architectural challenges.",
          "Sheaphards and evolves architecture at an organizational level. Aligns technical vision across teams. Leads and oversees TRD development and review processes. Provides timely, constructive feedback. Sets standards for design and specification practices.",
        ],
      },
      {
        name: "Testing & Validation",
        expectations: [
          "Understands the importance of validation and testing. Follows squad SOPs and regulatory processes as required. Writes tests according to established team practices.",
          "Contributes to higher-level test workflows including end-to-end and data validation. Applies testing frameworks effectively. Understands the regulatory scope and participates in product verification and validation (V&V).",
          "Proactively completes all forms of testing and plays an active role in verification and validation (V&V) activities. Proficient in applying and extending existing frameworks. Understands the product's regulatory context. Actively leads creation and assessment of validation data and documentation. Familiar with standards and compliance governing the company activities.",
          "Leads all levels of testing and validation ensuring they are built into day to day processes. Understands the product's regulatory context and leads verification and validation (V&V) activities including assessment of validation data and documentation. Assesses risk and preempts issues before they arise. Deep knowledge of standards and compliance governing the company activities.",
          "Models a culture of high technical rigor, quality standards and supports on full adoption and execution. Drives mission critical validation initiatives from first principles. Represents the function with external and internal stakeholders regarding quality and compliance.",
          "Sets and maintains a culture of high technical rigor. Manages and ensures adherence to quality standards and processes. Drives mission critical validation initiatives and manages resource allocation relative to risk and regulatory context. Represents the function with external and internal stakeholders regarding quality and compliance.",
        ],
      },
      {
        name: "Documentation & Knowledge Sharing",
        expectations: [
          "Reads and contributes to existing documentation to understand system components. Updates documentation as required.",
          "Writes clear, concise, and comprehensive documentation. Improves and creates documentation independently as needed.",
          "Champions documentation best practices. Leads documentation for key system areas and supports other areas and other team members through review and guidance.",
          "Establishes and enforces squad-level documentation standards. Owns documentation structure and consistency for major system components. Ensures documentation is integral to delivery and proactively addresses gaps.",
          "Promotes a culture of high-quality documentation. Demonstrates how strong documentation enables velocity and clarity across the function. Mentors others to write clear, complete, and maintainable content.",
          "Leads by example in maintaining high-quality documentation. Mentors others and ensures documentation aligns with team goals and delivery timelines. Tracks and manages team contribution and documentation practices.",
        ],
      },
      {
        name: "Tooling & Automation",
        expectations: [
          "Understands team workflows, tooling, and associated risks and policies. Applies them appropriately with guidance. Actively explores and suggests alternatives. Uses AI in line with existing guardrails and processes.",
          "Improves existing automations and CI/CD pipelines for performance, testability, and clarity. Leverages automation, open-source tools, and AI to boost delivery quality and speed where appropriate.",
          "Adopts and standardizes automation, open-source, and AI tools that enhance engineering velocity and quality. Coaches others on effective use.",
          "Expert in tooling and automation that scales delivery. Advocates continuous improvement and safe, ethical adoption of AI and emerging technologies across the squad.",
          "Leads strategic adoption of automation, AI, and open-source tools to enhance engineering effectiveness. Drives cross-squad and cross-functional initiatives to integrate emerging technologies while ensuring reliability and compliance.",
          "Oversees consistent, effective tooling and automation practices across the function. Drives investment in technologies that streamline engineering workflows. Ensures safe and ethical AI use.",
        ],
      },
    ]

    craft_dimensions.each do |dim|
      dimension = Dimension.create!(
        rubric_id: rubric.id,
        category_id: craft_category.id,
        name: dim[:name],
      )

      dim[:expectations].each_with_index do |description, idx|
        Expectation.create!(
          dimension_id: dimension.id,
          job_title_id: job_titles.values[idx].id,
          description: description,
        )
      end
    end

    # Execution & Delivery
    execution_category = Category.create!(
      rubric_id: rubric.id,
      name: "Execution & Delivery",
    )

    execution_dimensions = [
      {
        name: "Estimation & Delivery",
        expectations: [
          "Delivers well-defined tasks on time with guidance. Asks thoughtful questions to build understanding.",
          "Estimates and delivers small-to-medium features with minimal supervision. Seeks answers independently and advises on effort based on system knowledge.",
          "Drives well-scoped TRDs and tickets for complex work. Owns full project delivery with minimal support. Writes clear tickets and accurate time estimates. Monitors estimate accuracy and improves over time. Leads post-incident reviews and systemic fixes. Balances scope, quality, and timelines effectively.",
          "Leads delivery of complex, cross-functional work. Defines success metrics and supports the team to meet delivery goals. Navigates competing priorities to deliver valuable outcomes with empathy for stakeholders.",
          "Oversees execution of high-impact, multi-team initiatives. Evolves SDLC practices for scale and quality. Advises leadership on effort, trade-offs, and timelines. Keeps focus on business value and deprioritizes non-critical work.",
          "Owns delivery outcomes across one or more squads. Balances staffing and timelines to meet goals. Manages multiple projects and delegates effectively. Ensures completion of initiatives on time. Communicates delays and changes clearly. Evolves and maintains disciplined SDLC and documentation practices. Supports TRD reviews and structured delivery. Drives predictable delivery, stakeholder confidence, and business-aligned prioritization.",
        ],
      },
      {
        name: "Ownership & Accountability",
        expectations: [
          "Takes ownership of individual tasks. Understands and strives to meet team standards. Owns mistakes, communicates issues transparently, and works to resolve them.",
          "Shephards one or more core components within the squad. Begins mentoring others and models accountability in delivery.",
          "Shephards all components within the squad, including delivery and maintenance. Commits to timelines and demonstrates ethical decision-making.",
          "Shephards squad roadmap and delivery. Takes responsibility across squads when needed. Proactively addresses issues regardless of origin.",
          "Models end-to-end stewardship of high-impact initiatives. Sets the standard for thorough and complete execution across teams.",
          "Drives squad-wide accountability and delivery. Holds team members to high standards and ensures timely, value-driven outcomes.",
        ],
      },
      {
        name: "Product and Specification Understanding",
        expectations: [
          "Delivers work aligned to tickets and seeks clarification when specs are unclear. Understands what they are asked to build.",
          "Proactively improves quality of tickets in line with specificaiton. Asks clarifying questions on requirements and contributes significanlty to non-functional requirement listing. Understands the broader context of the requirements within the product stack and can ideate on improvements and issues.",
          "Maintains a high understanding of specifications and product context. Provides expert advice on component specification they are familiar with, both functional and non-functional. Ensures PRDs are complete and well formed and seeks clarification and further improvement when not. Can represent the squad at business reviews and product roadmap sessions and can communicate their squads roadmap well.",
          "Leads cross-squad technical specification efforts. Understands and supports PMs on cross squad product requirements and PRD review. Maintains a high understanding of specifications and product context across squads. Frequently represents the squad at business reviews and product roadmap sessions. Can outline easily their squads roadmap and understands the roadmap of other squads. Identifies initatives to implement non-functional requirements that consistently drive business value and product quality.",
          "Operates with autonomy and anticipates long-term organizational requirements, proactively addressing them before they become blockers or urgent issues. Identifies and takes action on requirements that may affect multiple business areas. Supports other functions with requirement interpretation and translates requirements relevant to other team actitivies. Deeply understands the business products, including strengths and areas requireing improvement. Champions initatives to implement non-functional requirements that consistently drive business value and product quality.",
          "Holds the team to high reliability standards and enforces quality gates. Manages specification/requirement implementation for the whole squad. Oversees execution to ensure adherence to product intended use. Ensures verification is completed and successful. Supports Product and other squads with understanding the delivery impact of requirements. Supports engineers to ensure reuqirements are well understood. Understands deeply the company products and services. Consistently drives improvement in processes related to specification translation and implementation.",
        ],
      },
      {
        name: "Delivery Quality & Compliance",
        expectations: [
          "Improves code quality based on feedback. Seeks to enhance the quality and completeness of deliverables. Participates in post-incident reviews. Proactively addresses corrective actions. Understands validation, verification, and relevant regulatory responsibilities.",
          "Improves squad deliverables by designing for reliability and edge cases. Proactively reviews corrective actions. Participates in audits. Incorporates validation into definition of done.  Applies relevant policies and standards in daily work.",
          "Leads quality improvements across the squad. Designs for reliability, elasticity, and scalability. Covers exception scenarios and drives validation. Leads focus areas in audits and ensures system compliance. Proactively closes compliance gaps.",
          "Champions quality-first practices and mentors the team on \"ilities\" including reliability, elasticity, scalability. Ensures validation is auditable. Deep knowledge of relevant policies and standards, and how they apply to the squads work. Makes pragmatic decisions that optimize for improved compliance and efficiency.Leads audit readiness across the squad, and embeds compliance into workflows. Balances quality with pragmatic decision-making.",
          "Defines quality engineering practices and policies across teams. Elevates standards for testing, validation, and long-term reliability at scale. Defines and embeds best-in-class specification and validation processes. Ensures components delivered meet business needs. Advises on compliance and regulatory requirements to any key stakeholders, internal or external. Assesses system against compliance requirements and advises on prioritisation of changes. Champions use of quality system. Drives evolution of quality system to meet business needs and improve overall quality.",
          "Manages and takes responsibility for successful validation and verification processes. Ensures components delivered meet business needs. Advises on compliance and regulatory requirements to any key stakeholders, internal or external. Assesses system against compliance requirements and advises on prioritisation of changes. Champions use of quality system. Drives evolution of quality system to meet business needs and improve overall quality.  Drives continued use and adoption of quality management system and processes including risk assessments and corrective actions. Understands and sets positive example when adhereing to proceedures.",
        ],
      },
      {
        name: "Risk Management",
        expectations: [
          "Delivers small, safe changes and learns how to use CI/CD and rollback tools. Understands risk based engineering and how it applies in the context of their work. Understands use of the company risk register and how it applies to their work.",
          "Identifies and addresses risks in scope and implementation. Uses CI/CD, feature flags, and validation practices to ensure safe, reversible changes. Proactively identifies and mitigates risks. Lists risks in the risk register and on tickets as needed.",
          "Designs work with risk mitigation strategies built in. Leads incident reviews and supports regulated change processes when applicable. Proactively identifies and addresses risks in TRD scope prior to implementation. Mentors others in the use of CI/CD, feature flags, and validation practices to ensure safe, reversible changes. Encourages team members to Proactively identifies and mitigates risks. Understands the types of risks, including patient safety, and how the work of their squad can influence overall risk. Ensures risks are appropriately lodged, mitigated and maintained.",
          "Gate keeps risks in TRD scope prior to implementation. Champions identification and mitigation of risks. Guides teams in designing resilient, verifiable systems, including regulated features. Understands risk type and how they affect different business and customer areas. Ensures risks are appropriately lodged, mitigated and maintained and supports others to do so.",
          "Manages systemic technical risks across teams or domains. Leads cross-squad and platform-level risk assessments and designs resilient architectures with built-in mitigations. Embeds risk-aware thinking into planning and execution, surfacing emerging risks (e.g., patient safety, data privacy, scalability). Ensures TRD reviews, risk registers, and failure mode analyses are thorough and forward-looking. Coaches teams on mitigation and safe deployment. Escalation point for technical risk and contributor to risk governance. Sets standards for risk-aware development, including validation, compliance, and test coverage. Shapes tools and policies for resilient, compliant delivery.",
          "Models mitigation of delivery and operational risk across the function, aligning engineering practices with business risk tolerance. Embeds risk awareness in planning and ensures technical risk and safe delivery buffers are factored into projects and deadlines. Identifies and mitigates execution risks through prioritisation, process refinement, or escalation. Ensures regular use of the risk register and adherence to controls. Collaborates with other functions including Product and Quality to align strategies with broader goals. Coaches engineers to identify risks early and deliver safely. Embeds compliance and controls in team processes.",
        ],
      },
    ]

    execution_dimensions.each do |dim|
      dimension = Dimension.create!(
        rubric_id: rubric.id,
        category_id: execution_category.id,
        name: dim[:name],
      )

      dim[:expectations].each_with_index do |description, idx|
        Expectation.create!(
          dimension_id: dimension.id,
          job_title_id: job_titles.values[idx].id,
          description: description,
        )
      end
    end

    # Collaboration & Communication
    collaboration_category = Category.create!(
      rubric_id: rubric.id,
      name: "Collaboration & Communication",
    )

    collaboration_dimensions = [
      {
        name: "Collaboration and Teamwork",
        expectations: [
          "Participates fully in stand-ups, retros, learning sessions, and code reviews.",
          "Coordinates with other functions to clarify requirements and unblock work. Shares context with adjacent squads when changes may affect them.",
          "Comes to discussions with an opinion and leads discussions, often collaboratively with adjacent teams (product, other engineering squads, science) to reach the best possible solution, often on complex issues.",
          "Acts as a bridge between engineering, product, science, and other departments to drive initiatives forward and resolve complex multi-team challenges.",
          "Mentors other senior and lead engineers in collaborative practices and cross-team leadership. Proactively builds cross-functional relationships across the entire organization, influencing decisions and aligning technical direction with broader business objectives.",
          "Partners with Product, Science, and other functions to prioritize roadmaps and ensure initiatives are delivered. Sets team trajectory, processes, cadence and delegates tasks to individuals/groups as needed",
        ],
      },
      {
        name: "Learning & Mentoring",
        expectations: [
          "Regularly seeks feedback and applies it effectively. Demonstrates curiosity and eagerness to grow. Participates actively in team learning and knowledge sharing.",
          "Independently researches before seeking help. Asks focused, insightful questions. Offers constructive feedback to peers and supports junior team members' growth.",
          "Mentors engineers within the squad and actively shares domain knowledge. Promotes continuous learning and facilitates squad-level knowledge sharing.",
          "Coaches team members in both technical and collaborative best practices. Guides design thinking and fosters a learning-oriented environment within the team.",
          "Mentors senior and lead engineers across the function. Shapes talent development strategy and models a learning culture. Drives initiatives that raise overall engineering capability.",
          "Builds and sustains a high-trust, growth-focused team culture. Identifies training needs and ensures engineers have access to learning opportunities. Champions mentoring practices across the team.",
        ],
      },
      {
        name: "Communication",
        expectations: [
          "Communicates in open channels actively and builds positive relationships within the immediate team.",
          "Works more independently while providing direction and benefit of experience to junior team members. Supports on inter-squad questions.",
          "Develops empathy for other departments and seeks to provide aid when needed. Clearly communicates project status, feedback, and requirements. Understands broader context.",
          "Fosters open, respectful communication. Aligns squad work with company and function goals. Manages cross-functional dependencies. Participates in cross-functional planning and strategy. Anticipates needs and connects the team with key people and resources.",
          "Drives strategic alignment across multiple teams or departments. Resolves complex interpersonal and technical misalignments through empathy, influence, and clear communication.",
          "Leads strategy, roadmapping, and planning. Communicates context and changes effectively to stakeholders. Responds clearly to information requests. Presents effectively in various contexts.",
        ],
      },
    ]

    collaboration_dimensions.each do |dim|
      dimension = Dimension.create!(
        rubric_id: rubric.id,
        category_id: collaboration_category.id,
        name: dim[:name],
      )

      dim[:expectations].each_with_index do |description, idx|
        Expectation.create!(
          dimension_id: dimension.id,
          job_title_id: job_titles.values[idx].id,
          description: description,
        )
      end
    end

    # Culture & Values
    culture_category = Category.create!(
      rubric_id: rubric.id,
      name: "Culture & Values",
    )

    culture_dimensions = [
      {
        name: "Demeanour, Respect and Inclusion",
        expectations: [
          "Demonstrates curiosity, humility, and respect in daily interactions.",
          "Consistently reliable and supportive, especially during incidents. Encourages contributions and models inclusive behavior in meetings and reviews.",
          "Maintains a calm, inclusive presence under pressure. Builds team culture through consistent actions, fosters psychological safety, and mentors with empathy.",
          "Promotes team values in decision-making and conflict resolution. Strengthens culture through inclusive practices and cultivates a high-trust, resilient environment.",
          "Integrates company values into function-wide norms and rituals. Advocates for diversity, equality and inclusion at scale. Respects all at all times. Leads with humility and composure, especially in ambiguous or high-stakes contexts.",
          "Hires, develops, and retains diverse, high-performing teams. Respects all at all times. Leads by example in respect and inclusion. Builds an environment where all can thrive and strengthens cross-functional trust.",
        ],
      },
      {
        name: "Support and Feedback",
        expectations: [
          "Seeks feedback and acts on it promptly. Accepts direction and constructive criticism with openness.",
          "Provides timely, actionable feedback that promotes growth. Acknowledges personal limitations and actively works to improve.",
          "Facilitates blameless retrospectives and code reviews that support team learning. Encourages growth in junior team members. Seeks and applies feedback from senior peers.",
          "Invests in others' career growth through coaching, sponsorship, and constructive feedback. Welcomes and responds to feedback from others.",
          "Drives cultural initiatives such as mentorship programs and values-driven practices. Offers meaningful guidance and supports peers across functions.",
          "Provides candid feedback and manages performance effectively. Sets a high standard for inclusive leadership and ethical decision-making. Actively supports team and cross-functional success.",
        ],
      },
    ]

    culture_dimensions.each do |dim|
      dimension = Dimension.create!(
        rubric_id: rubric.id,
        category_id: culture_category.id,
        name: dim[:name],
      )

      dim[:expectations].each_with_index do |description, idx|
        Expectation.create!(
          dimension_id: dimension.id,
          job_title_id: job_titles.values[idx].id,
          description: description,
        )
      end
    end

    # Industry & Mission Alignment
    industry_category = Category.create!(
      rubric_id: rubric.id,
      name: "Industry & Mission Alignment",
    )

    industry_dimensions = [
      {
        name: "Industry and Innovation Awareness",
        expectations: [
          "Eager to learn new technologies and stays updated on industry trends.",
          "Tracks relevant frameworks and trends. Suggests technology aligned with mission and goals.",
          "Expert in their own domain and identifies impactful tools and processes.",
          "Represents the team externally through talks, events, and outreach. Communicates technical strategy to multiple audiences.",
          "Identifies disruptive risks and innovation opportunities. Guides investment and resource strategy accordingly.",
          "Identifies disruptive risks and innovation opportunities. Guides investment and resource strategy accordingly. Stays current on engineering leadership trends. Connects adjacent business problems with potential product solutions.",
        ],
      },
      {
        name: "Advocacy & Mission Awareness",
        expectations: [
          "Can explain core product features and typical customer scenarios.",
          "Understands product principles, key scientific concepts, and how features solve customer problems.",
          "Clearly understands the company mission and product value. Familiar with microbiome science and diagnostic testing concepts. Can articulate the company's pitch.",
          "Anticipates market trends and integrates them into technical planning. Expert in some areas of company mission. Identifies competitive opportunities and advocates for evaluation.",
          "Represents the company, products, technology, and mission to external audiences. Shapes external perception through public speaking, writing, and leadership.",
          "Clearly communicates the company, products, and mission externally. Shapes company image through leadership and outreach.",
        ],
      },
    ]

    industry_dimensions.each do |dim|
      dimension = Dimension.create!(
        rubric_id: rubric.id,
        category_id: industry_category.id,
        name: dim[:name],
      )

      dim[:expectations].each_with_index do |description, idx|
        Expectation.create!(
          dimension_id: dimension.id,
          job_title_id: job_titles.values[idx].id,
          description: description,
        )
      end
    end
  end

  def down
    Expectation.delete_all
    Dimension.delete_all
    Category.delete_all
    JobTitle.delete_all
    Rubric.delete_all
  end
end
