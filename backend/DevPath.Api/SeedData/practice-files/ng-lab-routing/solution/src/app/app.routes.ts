import { Routes } from '@angular/router';
import { CourseListComponent } from './components/course-list/course-list.component';
import { CourseDetailComponent } from './components/course-detail/course-detail.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: CourseListComponent },
  { path: 'courses/:id', component: CourseDetailComponent },
  { path: '**', component: NotFoundComponent },
];
