"use client"

import { useRouter } from "next/navigation";
import { CalendarProps } from "./Calendar.type";

import { formatDate } from "@/lib/formatDate";

import { DateSelectArg, EventContentArg } from '@fullcalendar/core/index.js';

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import multiMonthPlugin from '@fullcalendar/multimonth'
import { ModalAddEvent } from "../ModalAddEvent";
import { useEffect, useMemo, useState } from "react";
import esLocale from '@fullcalendar/core/locales/es';
import axios from "axios";
import { toast } from "sonner";

export function Calendar(props: CalendarProps) {
    const { companies, events } = props;
    const router = useRouter();
    //const calendarEvents = useMemo(() => events, [events]);
    const [calendarEvents, setCalendarEvents] = useState(events);
    const [open, setOpen] = useState(false);
    const [onSaveNewEvent, setOnSaveNewEvent] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DateSelectArg>();
    const [newEvent, setNewEvent] = useState({
        eventName: "",
        companySelected: {
            name: "",
            id: "",
        }
    });


    useEffect(() => {
        if (onSaveNewEvent && selectedItem?.view.calendar) {
            const calendarApi = selectedItem.view.calendar;
            calendarApi.unselect();

            const newEventPrisma = {
                companyId: newEvent.companySelected.id,
                title: newEvent.eventName,
                start: new Date(selectedItem.start),
                allDay: false,
                timeFormat: 'H(:mm)'
            }

            axios.post(`/api/companies/${newEvent.companySelected.id}/event`, newEventPrisma)
                .then((res) => {
                    toast("Success", {
                        description: "Event Created!",
                    });
                    setCalendarEvents(prev => [...prev, res.data]);
                })
                .catch(error => {
                    console.log(error);
                    toast("Error", {
                        description: "Error Event Not Created!",
                    })
                })

            setNewEvent({
                eventName: "",
                companySelected: {
                    name: "",
                    id: "",
                }
            })
            setOnSaveNewEvent(false);
        }
    }, [onSaveNewEvent, selectedItem, event])

    const handleEventClick = async (selected: any) => {
        if (window.confirm(
            `Are you sure you want to delete this event ${selected.event.title}`
        )) {
            try {
                await axios.delete(`/api/event/${selected.event._def.publicId}`);
                selected.event.remove();
                setCalendarEvents(prev => prev.filter(ev => ev.id !== selected.event._def.publicId));
                toast("Success", {
                    description: "Event deleted!",
                });
                
            }
            catch(error){
                toast("Error", {
                    description: "Something went wrong!",
                });
            }
        }
    };

    const handleDateClick = async (selected: DateSelectArg) => {
        setOpen(true);
        setSelectedItem(selected);
    };

    return (
        <div>
            <div className="md:flex gap-x-3">
                <div className="w-[200px] relative">
                    <div className="overflow-auto absolute left-0 top-0 h-full w-full">
                        <p className="mb-3 text-xl">Listado de tareas</p>
                        {
                            calendarEvents.map((currentEvent) => (
                                <div key={currentEvent.id} className="p-4 rounded-lg shadow-md mb-2 bg-slate-200 dark:bg-background">
                                    <p className="font-bold">{currentEvent.title}</p>
                                    <p>{formatDate(currentEvent.start)}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="flex-1 calendar-container">
                    <FullCalendar plugins={[dayGridPlugin, timeGridPlugin,
                        interactionPlugin, listPlugin, multiMonthPlugin]}
                        headerToolbar={{
                            left: "prev, next today",
                            center: "title",
                            right: "timeGridDay, timeGridWeek, dayGridMonth, multiMonthYear, listMonth"
                        }}
                        height="80vh"
                        initialView="dayGridMonth"
                        weekends={false}
                        events={calendarEvents}
                        eventContent={renderEventContent}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        select={handleDateClick}
                        eventClick={handleEventClick}
                        locales={[esLocale]}
                        locale="es"
                    />
                </div>
            </div>
            <ModalAddEvent
                open={open}
                setOpen={setOpen}
                setOnSaveNewEvent={setOnSaveNewEvent}
                setNewEvent={setNewEvent}
                companies={companies}
            />
        </div>
    )
}

function renderEventContent(eventInfo: EventContentArg) {
    return (
        <div className="bg-slate-200 dark:bg-background w-full p-1">
            <i>{eventInfo.event.title}</i>
        </div>
    )
}