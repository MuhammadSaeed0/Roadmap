import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COURSES } from '../../data/courses';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink],
  template: `
    @if (course(); as c) {
      <h1>{{ c.title }}</h1>
      <p>{{ c.description }}</p>
    } @else {
      <p>Course not found</p>
    }
    <a routerLink="/">Back to the list</a>
  `,
})
export class CourseDetailComponent {
  readonly id = input<string>();
  readonly course = computed(() => COURSES.find(c => c.id === Number(this.id())));
}
