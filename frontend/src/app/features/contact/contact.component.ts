import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        LucideAngularModule
    ],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.css'
})
export class ContactComponent {
    contactForm = {
        name: '',
        email: '',
        subject: '',
        customSubject: '',
        message: ''
    };

    subjects = [
        'Report a Bug',
        'Suggest a Feature',
        'Technical Support',
        'Partnership / Collaboration',
        'General Feedback',
        'Other'
    ];

    submitted = false;

    onSubmit() {
        console.log('Contact Form Submitted:', this.contactForm);
        this.submitted = true;
        // In a real app, you'd call a service here
    }
}
