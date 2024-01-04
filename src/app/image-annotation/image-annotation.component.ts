import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as markerjs2 from "markerjs2";
import { ImageData } from './image-annotation.model';
import { environment } from '../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

const encapsulationValue: any = (null as any) as number;
@Component({
	selector: 'app-image-annotation',
	templateUrl: './image-annotation.component.html',
	styleUrl: './image-annotation.component.css',
})

export class ImageAnnotationComponent implements OnInit {
	images: any[] = [];
	selectedImage: any;
	selectedFile: File | null = null;
	showEditedContent: boolean = true;
	showOriginalContent: boolean = false;
	sourceImage: any;
	targetRoot: any;
	maState: any;


	constructor(private http: HttpClient, private modalService: NgbModal, private toastr: ToastrService) { }
	@ViewChild('addImageModal') addImageModal: any;

	ngOnInit(): void {
		this.getImages();
	}

	setSourceImage(source: any) {
		this.sourceImage = source;
		this.targetRoot = source.parentElement;
	}

	showMarkerArea(target: any): void {
		const markerArea = new markerjs2.MarkerArea(target);
		markerArea.targetRoot = this.targetRoot;
		markerArea.addEventListener("render", (event) => {
			target.src = event.dataUrl;
			this.maState = event.state;
		});
		markerArea.show();
		if (this.maState) {
			markerArea.restoreState(this.maState);
		}
	}

	getImages(): void {
		const apiUrl = `${environment.apiUrl}/Image`;
		this.http.get<{ data: ImageData[] }>(apiUrl).subscribe(
			(response) => {
				this.images = response.data || [];
			},
			(error) => {
				console.error('Error fetching images:', error);
			}
		);
	}

	editImage(image: ImageData): void {
		this.selectedImage = image;
		this.sourceImage = image;
		this.maState = JSON.parse(image.markState);
		this.setSourceImage(document.getElementById("sourceImage"));
		const sampleImage = document.getElementById("sampleImage") as HTMLImageElement | null;
		if (sampleImage) {
			sampleImage.addEventListener("click", () => {
				this.showMarkerArea(sampleImage);
			});
		}
	}

	deleteImage(imageId: number): void {
		const apiUrl = `${environment.apiUrl}/Image/${imageId}`;
		this.http.delete(apiUrl).subscribe(
			() => {
				this.images = this.images.filter((img) => img.id !== imageId);
				this.showSuccessToaster('Image Delete successfully');
			},
			(error) => {
				this.showErrorToaster('Error deleting image');
			}
		);
	}

	onFileSelected(event: any): void {
		this.selectedFile = event.target.files[0] as File;
	}

	saveAnnotation(): void {
		const imageId = this.selectedImage?.id;

		if (imageId) {
			const markState = this.maState;
			const apiUrl = `${environment.apiUrl}/Image/${imageId}`;
			const requestBody = {
				MarkState: JSON.stringify(markState) || ""
			};
			console.log(this.maState);

			this.http.put(apiUrl, requestBody).subscribe(
				(response) => {
					this.showSuccessToaster('Image Saved successfully');
				},
				(error) => {
					this.showErrorToaster('Unable to save image');
				}
			);
		} else {
			this.showErrorToaster('Unable to save image');
		}
	}

	uploadImage(): void {
		if (this.selectedFile) {
			const formData = new FormData();
			formData.append('image', this.selectedFile);
			const apiUrl = `${environment.apiUrl}/image`;

			this.http.post(apiUrl, formData).subscribe(
				(response) => {
					this.getImages();
					this.modalService.dismissAll();
					this.showSuccessToaster('Image Added successfully');
				},
				(error) => {
					this.showErrorToaster('Unable to upload image');
				}
			);
		} else {
			this.showErrorToaster('Unable to upload image');
		}
	}

	openAddImageModal(): void {
		this.modalService.open(this.addImageModal, { centered: true });
	}

	showOriginal(): void {
		this.showEditedContent = false;
		this.showOriginalContent = true;
	}

	continueEdit(): void {
		this.showEditedContent = true;
		this.showOriginalContent = false;
	}

	private showSuccessToaster(message: string): void {
		const options= { positionClass:'toast-top-right' };
		this.toastr.success(message, 'Success', options);
	  }
	  
	  private showErrorToaster(message: string): void {
		this.toastr.error(message, 'Error');
	  }
}
