import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PriceRangeChart } from "../../models/interfaces";
import { getPositionPeriod } from "../../utils/time";
import stc from "string-to-color";
import "./index.scss";
import { ChevronDown, Layers } from "react-feather";

interface PositionsSelectProps {
    positions: {
        closed: PriceRangeChart | null;
        opened: PriceRangeChart | null;
    };
    selected: string[];
    setSelected: (a: any) => void;
}

export default function PositionsSelect({ positions: { closed, opened }, setSelected, selected }: PositionsSelectProps) {
    const _opened = useMemo(() => {
        const res = [];
        for (const key in opened) {
            res.push({
                id: key,
                start: opened[key].startTime,
            });
        }
        return res;
    }, [opened]);
    const _closed = useMemo(() => {
        const res = [];
        for (const key in closed) {
            res.push({
                id: key,
                start: closed[key].startTime,
                end: closed[key].endTime,
            });
        }
        return res;
    }, [closed]);

    // console.log(closed)

    const closeHandler = useCallback((e) => {
        const target = e.target.control;

        if (!target) return;

        target.checked = false;
    }, []);

    const updateSelect = (id: string) => {
        if (selected.some((el) => el === id)) {
            const index = selected.indexOf(id);
            if (index > -1) {
                const temp = [...selected];
                temp.splice(index, 1);
                setSelected(temp);
            }
        } else {
            setSelected((prev: any) => [...prev, id]);
        }
    };

    return (
        <div className={"positions-range-input"}>
            <input type="checkbox" id="positions" />
            <label htmlFor="positions" role={"button"} tabIndex={0} onBlur={closeHandler} className={"positions-range-input__label"}>
                <div className={"positions-range-input__title br-8 f f-ac f-jb"}>
                    <span className="mr-05">
                        <Layers size={14} />
                    </span>
                    <span className="fs-085">
                        {selected.length === 0 ? (
                            "My positions"
                        ) : (
                            <span>
                                {selected.map((id, key, arr) => (
                                    <span className={"positions-range-input__tooltip-item"} key={key}>
                                        <span className={"positions-range-input__tooltip-circle"} style={{ backgroundColor: stc(id) }}></span>
                                        <span>{`${id}`}</span>
                                    </span>
                                ))}
                            </span>
                        )}
                    </span>
                </div>
                <div className="positions-range-input__inner">
                    {_opened.length > 0 ? (
                        <>
                            <div className="pv-05 ph-1">Opened positions</div>
                            <ul className={"positions-range-input__list"} onClick={(e) => e.preventDefault()}>
                                {_opened.map((item) => (
                                    <li className="positions-range-input__list-item" key={item.id} onClick={() => updateSelect(item.id)}>
                                        <span className={"positions-range-input__list-item__circle"} style={{ backgroundColor: stc(item.id) }}></span>
                                        <span className={"positions-range-input__list-item__id ml-05"}>{item.id}</span>
                                        <span className={"positions-range-input__list-item__date ml-a"}>{getPositionPeriod(item.start)}</span>
                                        <span className={`positions-range-input__list-item__checked ${selected.includes(item.id) ? "active" : ""} ml-1`}></span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : null}
                    {_closed.length > 0 ? (
                        <>
                            <div className="pv-05 ph-1">Closed positions</div>
                            <ul className={"positions-range-input__list"} onClick={(e) => e.preventDefault()}>
                                {_closed.map((item) => (
                                    <li className="positions-range-input__list-item" key={item.id} onClick={() => updateSelect(item.id)}>
                                        <span className={"positions-range-input__list-item__circle"} style={{ backgroundColor: stc(item.id) }}></span>
                                        <span className={"positions-range-input__list-item__id ml-05"}>{item.id}</span>
                                        <span className={"positions-range-input__list-item__date ml-a"}>{getPositionPeriod(item.start, item.end)}</span>
                                        <span className={`positions-range-input__list-item__checked ${selected.includes(item.id) ? "active" : ""} ml-1`}></span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : null}
                </div>
            </label>
        </div>
    );
}
