import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImageAnnotationComponent } from './image-annotation/image-annotation.component';

@NgModule({
	declarations: [
		AppComponent,
		ImageAnnotationComponent
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		ToastrModule.forRoot({
			positionClass: 'toast-top-right',
		})
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
