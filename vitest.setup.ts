// 컴포넌트 테스트용 전역 셋업.
// jest-dom의 DOM 매처(toBeInTheDocument, toBeDisabled 등)를 Vitest의 expect에 등록한다.
// "/vitest" 진입점을 써야 Vitest에 매처가 붙는다. (Jest 러너를 쓰는 게 아님)
import "@testing-library/jest-dom/vitest";
