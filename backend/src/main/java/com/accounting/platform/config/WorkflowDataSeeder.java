package com.accounting.platform.config;

import com.accounting.platform.contact.entity.Contact;
import com.accounting.platform.contact.entity.ContactType;
import com.accounting.platform.contact.repository.ContactRepository;
import com.accounting.platform.workflow.entity.Job;
import com.accounting.platform.workflow.entity.Task;
import com.accounting.platform.workflow.entity.Workflow;
import com.accounting.platform.workflow.entity.WorkflowStage;
import com.accounting.platform.workflow.repository.JobRepository;
import com.accounting.platform.workflow.repository.TaskRepository;
import com.accounting.platform.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.LocalDate;
import java.util.Arrays;

@Configuration
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class WorkflowDataSeeder {

    private final WorkflowRepository workflowRepository;
    private final JobRepository jobRepository;
    private final TaskRepository taskRepository;
    private final ContactRepository contactRepository;

    @Bean
    public CommandLineRunner seedWorkflowData() {
        return args -> {
            if (workflowRepository.count() > 0) {
                log.info("Workflows already seeded");
                return;
            }

            log.info("Seeding Workflow Data...");

            // 1. Create Contacts if needed
            Contact client1 = createContact("Acme Corp", "john@acme.com", ContactType.CUSTOMER);
            Contact client2 = createContact("Stark Industries", "tony@stark.com", ContactType.CUSTOMER);
            Contact client3 = createContact("Wayne Enterprises", "bruce@wayne.com", ContactType.CUSTOMER);

            // 2. Create "Tax Return" Workflow
            Workflow taxWorkflow = new Workflow();
            taxWorkflow.setName("Individual Tax Return (1040)");
            taxWorkflow.setDescription("Standard annual tax return process");

            WorkflowStage s1 = createStage("Data Collection", 1, true, false);
            WorkflowStage s2 = createStage("Preparation", 2, false, false);
            WorkflowStage s3 = createStage("Review", 3, false, false);
            WorkflowStage s4 = createStage("Assembly & Delivery", 4, false, false);
            WorkflowStage s5 = createStage("E-File", 5, false, true);

            taxWorkflow.addStage(s1);
            taxWorkflow.addStage(s2);
            taxWorkflow.addStage(s3);
            taxWorkflow.addStage(s4);
            taxWorkflow.addStage(s5);

            workflowRepository.save(taxWorkflow);

            // 3. Create Sample Jobs
            createJob("Acme Corp - 2024 Tax Return", taxWorkflow, s2, client1, LocalDate.now().plusDays(15));
            createJob("Stark Ind - 2024 Tax Return", taxWorkflow, s3, client2, LocalDate.now().plusDays(5));
            createJob("Wayne Ent - 2024 Tax Return", taxWorkflow, s1, client3, LocalDate.now().plusDays(30));

            createAdditionalWorkflows();

            log.info("Workflow Data Seeded Successfully");
        };
    }

    private Contact createContact(String name, String email, ContactType type) {
        return contactRepository.findByEmail(email).orElseGet(() -> {
            Contact c = new Contact();
            c.setName(name); // Use type as name for simplicity if name field differs
            // c.setCompanyName(name); // Removed as field does not exist, name covers it
            c.setEmail(email);
            c.setType(type);
            c.setTaxId("00-0000000");
            return contactRepository.save(c);
        });
    }

    private WorkflowStage createStage(String name, int order, boolean initial, boolean isFinal) {
        WorkflowStage s = new WorkflowStage();
        s.setName(name);
        s.setOrderIndex(order);
        s.setInitial(initial);
        s.setFinal(isFinal);
        return s;
    }

    private void createJob(String name, Workflow wf, WorkflowStage stage, Contact contact, LocalDate due) {
        Job job = new Job();
        job.setName(name);
        job.setWorkflow(wf);
        job.setCurrentStage(stage);
        job.setContact(contact);
        job.setDueDate(due);
        job = jobRepository.save(job);

        // Add sample tasks
        createTask("Gather W2s", job);
        createTask("Import Clean Data", job);
    }

    private void createTask(String title, Job job) {
        Task t = new Task();
        t.setTitle(title);
        t.setJob(job);
        t.setCompleted(false);
        taskRepository.save(t);
    }

    private void createAdditionalWorkflows() {
        // 1. Create "Monthly Bookkeeping" Workflow
        Workflow bookkeeping = new Workflow();
        bookkeeping.setName("Monthly Bookkeeping");
        bookkeeping.setDescription("Monthly reconciliation and reporting cycle");

        bookkeeping.addStage(createStage("Data Import", 1, true, false));
        bookkeeping.addStage(createStage("Transaction Categorization", 2, false, false));
        bookkeeping.addStage(createStage("Bank Reconciliation", 3, false, false));
        bookkeeping.addStage(createStage("Manager Review", 4, false, false));
        bookkeeping.addStage(createStage("Reporting", 5, false, true));

        workflowRepository.save(bookkeeping);

        // 2. Create "Payroll" Workflow
        Workflow payroll = new Workflow();
        payroll.setName("Payroll Processing");
        payroll.setDescription("Bi-weekly payroll execution");

        payroll.addStage(createStage("Timesheet Collection", 1, true, false));
        payroll.addStage(createStage("Hours Entry", 2, false, false));
        payroll.addStage(createStage("Approval", 3, false, false));
        payroll.addStage(createStage("Processing", 4, false, false));
        payroll.addStage(createStage("Filing & Payment", 5, false, true));

        workflowRepository.save(payroll);
    }
}
