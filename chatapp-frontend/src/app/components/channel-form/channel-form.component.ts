import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from '../../shared/services/channel.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channel-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './channel-form.component.html',
  styleUrls: ['./channel-form.component.css'],
})
export class ChannelFormComponent implements OnInit {
  channelForm!: FormGroup;
  isEditMode = false;
  channelId!: number;

  constructor(
    private fb: FormBuilder,
    private channelService: ChannelService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.channelId = +params['id'];
      }

      this.initializeForm();

      if (this.isEditMode) {
        this.loadChannelDetails();
      }
    });
  }

  initializeForm(): void {
    this.channelForm = this.fb.group({
      name: ['', [Validators.required]], 
    });
  }

  loadChannelDetails(): void {
    this.channelService.getChannelById(this.channelId).subscribe((channel) => {
      this.channelForm.patchValue({
        name: channel.name,
      });
    });
  }

  onSubmit(): void {
    if (this.channelForm.invalid) {
      alert('Please fill out the form correctly.');
      return;
    }

    const userId = localStorage.getItem('userId') || ''; 
  const channelName = this.channelForm.controls['name'].value; 
  

    if (this.isEditMode) {
      this.channelService.updateChannel(this.channelId, userId, channelName).subscribe(
        () => {
          alert('Channel updated successfully.');
          this.router.navigate(['/channel-list']);
        },
        (error) => {
          console.error('Error updating channel:', error);
          const errorMessage =
            error.error?.message || 'Failed to update channel. Please try again.';
          alert(errorMessage);
        }
      );
    } else {
      const channelData = {
        channelName: channelName,
        ownerId: userId,
      };
      this.channelService.createChannel(channelData).subscribe(
        () => {
          alert('Channel created successfully.');
          this.router.navigate(['/channel-list']);
        },
        (error) => {
          console.error('Error creating channel:', error);
          const errorMessage =
            error.error?.message || 'Failed to create channel. Please try again.';
          alert(errorMessage);
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/channel-list']);
  }
}
